import { db } from "@/lib/db";

// session.user.planName is cached in the JWT at sign-in and only refreshes on
// re-login or an explicit client-side session.update() — so it goes stale as
// soon as a plan changes server-side (e.g. an admin override). Anywhere that
// needs the seller's *current* plan should read it fresh from the DB instead.
export async function getSellerPlanName(sellerId: string): Promise<string> {
  const subscription = await db.sellerSubscription.findUnique({
    where: { sellerId },
    select: { plan: { select: { name: true } } },
  });
  return subscription?.plan.name ?? "free";
}
