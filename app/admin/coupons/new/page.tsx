import { db } from "@/lib/db";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function NewCouponPage() {
  const plans = await db.subscriptionPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const planOptions = plans.map((p) => ({
    id: p.id,
    displayName: p.displayName,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Create coupon</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define a new discount code for subscription plans.
        </p>
      </div>

      <CouponForm planOptions={planOptions} />
    </div>
  );
}
