import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { ISubscriptionPlan } from "@/types";

export async function GET() {
  const cacheKey = "subscription:plans";
  const cached = await getCached<ISubscriptionPlan[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const result = plans.map((p) => ({
    ...p,
    priceUsd: Number(p.priceUsd),
    priceLkr: Number(p.priceLkr),
  }));

  await setCached(cacheKey, result, 3600); // cache 1 hour
  return NextResponse.json(result);
}
