import { NextResponse } from "next/server";
import { Metal } from "@prisma/client";
import { db } from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";

export async function GET() {
  const cacheKey = "metal-prices:current";
  const cached = await getCached<unknown>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const metals = ["GOLD_24K", "GOLD_22K", "SILVER", "PLATINUM"];

  const prices = await Promise.all(
    metals.map((metal) =>
      db.metalPrice.findFirst({
        where: { metal: metal as Metal },
        orderBy: { fetchedAt: "desc" },
      }),
    ),
  );

  const result = prices.filter(Boolean).map((p) => ({
    metal: p!.metal,
    priceUsdPerGram: Number(p!.priceUsdPerGram),
    priceLkrPerGram: Number(p!.priceLkrPerGram),
    changePercent24h: p!.changePercent24h ? Number(p!.changePercent24h) : 0,
    fetchedAt: p!.fetchedAt,
  }));

  await setCached(cacheKey, result, 300); // 5-minute cache
  return NextResponse.json(result);
}
