import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  const plans = [
    {
      name: "free",
      displayName: "Free",
      priceUsd: 0,
      priceLkr: 0,
      priceUsdAnnual: 0,
      priceLkrAnnual: 0,
      maxListings: 3,
      maxReelsPerMonth: 0,
      maxImagesPerListing: 3,
      maxCertificationImages: 3,
      listingDurationDays: 30, // listings expire after 30 days
      hasShopProfile: false,
      hasAnalytics: false,
      hasRealtimeAlerts: false,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 0,
      freeBoostsRemaining: 0,
      supportLevel: "community",
      badgeFastTrack: false,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 0,
    },
    {
      name: "basic",
      displayName: "Basic",
      priceUsd: 9,
      priceLkr: 2970,
      priceUsdAnnual: 90,
      priceLkrAnnual: 29700,
      maxListings: 20,
      maxReelsPerMonth: 1,
      maxImagesPerListing: 5,
      maxCertificationImages: 5,
      listingDurationDays: 90, // listings expire after 90 days
      hasShopProfile: true,
      hasAnalytics: false,
      hasRealtimeAlerts: false,
      hasDigitalMarketing: false,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: false,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 1,
      freeBoostsRemaining: 1,
      supportLevel: "email",
      badgeFastTrack: false,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 1,
    },
    {
      name: "pro",
      displayName: "Pro",
      priceUsd: 25,
      priceLkr: 8250,
      priceUsdAnnual: 250,
      priceLkrAnnual: 82500,
      maxListings: null,
      maxReelsPerMonth: null,
      maxImagesPerListing: 7,
      maxCertificationImages: 5,
      listingDurationDays: 180, // listings expire after 180 days
      hasShopProfile: true,
      hasAnalytics: true,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: true,
      hasWhatsappBroadcast: false,
      hasPrioritySearch: true,
      hasApiAccess: false,
      hasWholesaleListings: false,
      monthlyFreeBoosts: 3,
      freeBoostsRemaining: 3,
      supportLevel: "priority",
      badgeFastTrack: true,
      badgeFree: false,
      homepageFeatureWeekly: false,
      sortOrder: 2,
    },
    {
      name: "dealer",
      displayName: "Dealer",
      priceUsd: 60,
      priceLkr: 19800,
      priceUsdAnnual: 600,
      priceLkrAnnual: 198000,
      maxListings: null,
      maxReelsPerMonth: null,
      maxImagesPerListing: 7,
      maxCertificationImages: 5,
      listingDurationDays: null, // never expires
      hasShopProfile: true,
      hasAnalytics: true,
      hasRealtimeAlerts: true,
      hasDigitalMarketing: true,
      hasWhatsappBroadcast: true,
      hasPrioritySearch: true,
      hasApiAccess: true,
      hasWholesaleListings: true,
      monthlyFreeBoosts: 7,
      freeBoostsRemaining: 7,
      supportLevel: "dedicated",
      badgeFastTrack: true,
      badgeFree: true,
      homepageFeatureWeekly: true,
      sortOrder: 3,
    },
  ];

  const planRecords: Record<string, { id: string }> = {};
  for (const plan of plans) {
    planRecords[plan.name] = await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ ${plan.displayName} plan`);
  }

  const coupons = [
    {
      code: "WELCOME50",
      description: "50% off all plans",
      discountType: "PERCENTAGE" as const,
      discountValue: 50,
      applicablePlanIds: [],
      billingCycle: null,
      maxUses: 200,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "ANNUAL20",
      description: "20% off when billed annually",
      discountType: "PERCENTAGE" as const,
      discountValue: 20,
      applicablePlanIds: [],
      billingCycle: "ANNUAL" as const,
      maxUses: null,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "PROFREE",
      description: "Pro plan free",
      discountType: "PERCENTAGE" as const,
      discountValue: 100,
      applicablePlanIds: [planRecords.pro.id],
      billingCycle: null,
      maxUses: 100,
      maxUsesPerUser: 1,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await db.couponCode.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
    console.log(`  ✓ Coupon: ${coupon.code}`);
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
