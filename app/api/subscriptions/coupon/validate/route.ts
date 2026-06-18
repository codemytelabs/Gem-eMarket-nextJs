import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { couponValidateSchema } from "@/lib/validations/subscription";
import {
  calculateDiscount,
  getAnnualPrice,
  isCouponApplicable,
} from "@/lib/utils/coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { code, planId, cycle } = parsed.data;

  const coupon = await db.couponCode.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
  });

  if (!coupon) {
    return NextResponse.json({
      valid: false,
      errorMessage: "Invalid or expired coupon code",
    });
  }

  if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
    return NextResponse.json({
      valid: false,
      errorMessage: "Coupon has reached its usage limit",
    });
  }

  const userRedemptions = await db.couponRedemption.count({
    where: { couponId: coupon.id, userId: session.user.id },
  });
  if (userRedemptions >= coupon.maxUsesPerUser) {
    return NextResponse.json({
      valid: false,
      errorMessage: "You have already used this coupon",
    });
  }

  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan)
    return NextResponse.json({ valid: false, errorMessage: "Plan not found" });

  const couponForDiscount = {
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    applicablePlanIds: coupon.applicablePlanIds,
    billingCycle: coupon.billingCycle,
  };

  const applicability = isCouponApplicable(couponForDiscount, {
    planId,
    cycle,
  });
  if (!applicability.ok) {
    return NextResponse.json({
      valid: false,
      errorMessage: applicability.reason,
    });
  }

  const planPriceUsd = Number(plan.priceUsd);
  const planPriceLkr = Number(plan.priceLkr);
  const basePrice =
    cycle === "ANNUAL"
      ? getAnnualPrice({
          priceUsd: planPriceUsd,
          priceLkr: planPriceLkr,
          priceUsdAnnual: plan.priceUsdAnnual
            ? Number(plan.priceUsdAnnual)
            : null,
          priceLkrAnnual: plan.priceLkrAnnual
            ? Number(plan.priceLkrAnnual)
            : null,
        })
      : { usd: planPriceUsd, lkr: planPriceLkr };

  const { discountUsd, discountLkr, finalPriceUsd, finalPriceLkr, freeMonths } =
    calculateDiscount(couponForDiscount, basePrice.usd, basePrice.lkr);

  return NextResponse.json({
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    },
    discountUsd,
    discountLkr,
    freeMonths,
    finalPriceUsd,
    finalPriceLkr,
  });
}
