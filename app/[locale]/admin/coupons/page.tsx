import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { CouponList } from "@/components/admin/CouponList";

export default async function AdminCouponsPage() {
  const [coupons, plans] = await Promise.all([
    db.couponCode.findMany({ orderBy: { createdAt: "desc" } }),
    db.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const serializedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    applicablePlanIds: c.applicablePlanIds,
    billingCycle: c.billingCycle,
    maxUses: c.maxUses,
    usesCount: c.usesCount,
    maxUsesPerUser: c.maxUsesPerUser,
    validFrom: c.validFrom?.toISOString() ?? null,
    validUntil: c.validUntil?.toISOString() ?? null,
    isActive: c.isActive,
  }));

  const planOptions = plans.map((p) => ({
    id: p.id,
    displayName: p.displayName,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount codes for subscription plans.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create coupon
        </Link>
      </div>

      <CouponList coupons={serializedCoupons} plans={planOptions} />
    </div>
  );
}
