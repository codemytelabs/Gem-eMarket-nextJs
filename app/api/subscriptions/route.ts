import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db.sellerSubscription.findUnique({
    where: { sellerId: session.user.id },
    include: { plan: true },
  });

  if (!subscription) {
    return NextResponse.json(
      { message: "No subscription found" },
      { status: 404 },
    );
  }

  const activeListings = await db.listing.count({
    where: { sellerId: session.user.id, status: "ACTIVE" },
  });

  return NextResponse.json({
    subscription: {
      ...subscription,
      priceUsd: Number(subscription.plan.priceUsd),
      priceLkr: Number(subscription.plan.priceLkr),
    },
    usage: { activeListings },
  });
}
