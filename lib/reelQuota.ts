import { db } from "@/lib/db";

export interface ReelQuotaStatus {
  allowed: boolean;
  remaining: number | null; // null = unlimited
  maxPerMonth: number | null; // null = unlimited
}

export async function getReelQuotaStatus(
  sellerId: string,
): Promise<ReelQuotaStatus> {
  const subscription = await db.sellerSubscription.findUnique({
    where: { sellerId },
    include: { plan: true },
  });
  const maxPerMonth = subscription ? subscription.plan.maxReelsPerMonth : 0;

  if (maxPerMonth === null) {
    return { allowed: true, remaining: null, maxPerMonth: null };
  }
  if (maxPerMonth === 0) {
    return { allowed: false, remaining: 0, maxPerMonth: 0 };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usedThisMonth = await db.reelUpload.count({
    where: { sellerId, createdAt: { gte: startOfMonth } },
  });

  const remaining = Math.max(0, maxPerMonth - usedThisMonth);
  return { allowed: remaining > 0, remaining, maxPerMonth };
}
