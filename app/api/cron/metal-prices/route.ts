import { NextRequest, NextResponse } from "next/server";
import { Metal } from "@prisma/client";
import { db } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { sendFcmToMultiple } from "@/lib/firebase-admin";
import { sendDailyMetalPriceDigest } from "@/lib/email";

// Called by cron-job.org every 15 minutes.
// Protect with a secret header so it can't be called publicly.
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "GOLDAPI_KEY not set" },
      { status: 500 },
    );
  }

  // Fetch USD/LKR rate (free, no key needed)
  let lkrRate = 330;
  try {
    const fxRes = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 86400 } },
    );
    const fxData = await fxRes.json();
    lkrRate = fxData.rates?.LKR ?? 330;
  } catch {}

  const metalSymbols: Array<{ symbol: string; metal: string }> = [
    { symbol: "XAU", metal: "GOLD_24K" },
    { symbol: "XAG", metal: "SILVER" },
    { symbol: "XPT", metal: "PLATINUM" },
  ];

  const rows = [];
  for (const { symbol, metal } of metalSymbols) {
    try {
      const res = await fetch(`https://www.goldapi.io/api/${symbol}/USD`, {
        headers: { "x-access-token": apiKey },
      });
      const data = await res.json();

      // GoldAPI returns price per troy oz — convert to per gram (1 troy oz = 31.1035g)
      const pricePerGram = data.price / 31.1035;
      const changePct = data.ch_24h ?? 0;

      rows.push({
        metal: metal as Metal,
        priceUsdPerGram: pricePerGram,
        priceLkrPerGram: pricePerGram * lkrRate,
        changePercent24h: changePct,
        source: "goldapi.io",
      });

      // Also insert GOLD_22K as 22/24 of 24K price
      if (metal === "GOLD_24K") {
        rows.push({
          metal: "GOLD_22K" as Metal,
          priceUsdPerGram: (pricePerGram * 22) / 24,
          priceLkrPerGram: ((pricePerGram * 22) / 24) * lkrRate,
          changePercent24h: changePct,
          source: "goldapi.io (derived)",
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${symbol}:`, err);
    }
  }

  if (rows.length > 0) {
    await db.metalPrice.createMany({ data: rows });
    await invalidateCache("metal-prices:current");
  }

  // Check price alerts and send FCM notifications
  const alerts = await db.metalPriceAlert.findMany({
    where: { isActive: true, alertType: { in: ["ABOVE", "BELOW"] } },
    include: { user: true },
  });

  for (const alert of alerts) {
    const priceRow = rows.find((r) => r.metal === alert.metal);
    if (!priceRow || !alert.thresholdUsd || !alert.fcmToken) continue;

    const crossed =
      (alert.alertType === "ABOVE" &&
        priceRow.priceUsdPerGram >= Number(alert.thresholdUsd)) ||
      (alert.alertType === "BELOW" &&
        priceRow.priceUsdPerGram <= Number(alert.thresholdUsd));

    if (crossed) {
      await sendFcmToMultiple(
        [alert.fcmToken],
        `${alert.metal.replace("_", " ")} price alert`,
        `${alert.metal} is now $${priceRow.priceUsdPerGram.toFixed(2)}/g`,
        { metal: alert.metal },
      ).catch(() => {});

      await db.metalPriceAlert.update({
        where: { id: alert.id },
        data: { lastTriggeredAt: new Date() },
      });
    }
  }

  // Send daily digest emails to BASIC plan sellers
  const isDigestTime = new Date().getHours() === 8; // 8 AM UTC
  if (isDigestTime) {
    const basicSellers = await db.user.findMany({
      where: {
        role: "SELLER",
        subscription: { plan: { name: "basic" } },
        emailVerified: { not: null },
      },
      select: { email: true, name: true },
    });

    const digestData = rows.map((r) => ({
      metal: r.metal,
      priceUsd: r.priceUsdPerGram,
      changePct: Number(r.changePercent24h),
    }));

    await Promise.allSettled(
      basicSellers.map((s) =>
        sendDailyMetalPriceDigest(s.email, s.name, digestData),
      ),
    );
  }

  return NextResponse.json({ updated: rows.length, timestamp: new Date() });
}
