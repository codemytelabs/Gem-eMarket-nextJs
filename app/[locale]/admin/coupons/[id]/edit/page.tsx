import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [coupon, plans] = await Promise.all([
    db.couponCode.findUnique({ where: { id } }),
    db.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!coupon) notFound();

  const planOptions = plans.map((p) => ({
    id: p.id,
    displayName: p.displayName,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Edit coupon</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the discount code settings.
        </p>
      </div>

      <CouponForm
        planOptions={planOptions}
        couponId={coupon.id}
        initialData={{
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          applicablePlanIds: coupon.applicablePlanIds,
          billingCycle: coupon.billingCycle,
          maxUses: coupon.maxUses,
          maxUsesPerUser: coupon.maxUsesPerUser,
          validFrom: coupon.validFrom?.toISOString() ?? null,
          validUntil: coupon.validUntil?.toISOString() ?? null,
          isActive: coupon.isActive,
        }}
      />
    </div>
  );
}
