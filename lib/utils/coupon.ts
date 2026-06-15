const USD_TO_LKR = 330;

export type CouponCycle = "MONTHLY" | "ANNUAL";

export interface CouponForDiscount {
  discountType: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
  discountValue: number;
  applicablePlanIds: string[];
  billingCycle: CouponCycle | null;
}

export interface DiscountResult {
  discountUsd: number;
  discountLkr: number;
  finalPriceUsd: number;
  finalPriceLkr: number;
  freeMonths: number;
}

/**
 * Checks whether a coupon can be applied to the given plan + billing cycle.
 */
export function isCouponApplicable(
  coupon: CouponForDiscount,
  { planId, cycle }: { planId: string; cycle: CouponCycle },
): { ok: boolean; reason?: string } {
  if (
    coupon.applicablePlanIds.length > 0 &&
    !coupon.applicablePlanIds.includes(planId)
  ) {
    return { ok: false, reason: "This coupon is not valid for this plan" };
  }

  // A coupon without an explicit billing cycle is a general/monthly offer —
  // it only discounts the monthly price, not the annual preview.
  const effectiveCycle = coupon.billingCycle ?? "MONTHLY";
  if (effectiveCycle !== cycle) {
    return {
      ok: false,
      reason: `This coupon is only valid for ${effectiveCycle === "ANNUAL" ? "annual" : "monthly"} billing`,
    };
  }

  return { ok: true };
}

/**
 * Computes the discount and final price for a plan price given a coupon.
 */
export function calculateDiscount(
  coupon: CouponForDiscount,
  priceUsd: number,
  priceLkr: number,
): DiscountResult {
  let discountUsd = 0;
  let discountLkr = 0;
  let freeMonths = 0;

  if (coupon.discountType === "PERCENTAGE") {
    const pct = coupon.discountValue / 100;
    discountUsd = priceUsd * pct;
    discountLkr = priceLkr * pct;
  } else if (coupon.discountType === "FIXED_USD") {
    discountUsd = Math.min(priceUsd, coupon.discountValue);
    discountLkr = Math.min(priceLkr, coupon.discountValue * USD_TO_LKR);
  } else if (coupon.discountType === "FREE_MONTHS") {
    freeMonths = coupon.discountValue;
  }

  return {
    discountUsd,
    discountLkr,
    finalPriceUsd: Math.max(0, priceUsd - discountUsd),
    finalPriceLkr: Math.max(0, priceLkr - discountLkr),
    freeMonths,
  };
}

/**
 * Annual price for a plan, falling back to monthly * 12 when not explicitly set.
 */
export function getAnnualPrice(plan: {
  priceUsd: number;
  priceLkr: number;
  priceUsdAnnual: number | null;
  priceLkrAnnual: number | null;
}): { usd: number; lkr: number } {
  return {
    usd: plan.priceUsdAnnual ?? plan.priceUsd * 12,
    lkr: plan.priceLkrAnnual ?? plan.priceLkr * 12,
  };
}
