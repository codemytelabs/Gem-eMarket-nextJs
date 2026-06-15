"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";

interface CouponListItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
  discountValue: number;
  applicablePlanIds: string[];
  billingCycle: "MONTHLY" | "ANNUAL" | null;
  maxUses: number | null;
  usesCount: number;
  maxUsesPerUser: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
}

interface PlanOption {
  id: string;
  displayName: string;
}

function discountSummary(coupon: CouponListItem) {
  switch (coupon.discountType) {
    case "PERCENTAGE":
      return `${coupon.discountValue}% off`;
    case "FIXED_USD":
      return `$${coupon.discountValue} off`;
    case "FREE_MONTHS":
      return `${coupon.discountValue} free month${coupon.discountValue === 1 ? "" : "s"}`;
    default:
      return "";
  }
}

function applicablePlansLabel(coupon: CouponListItem, plans: PlanOption[]) {
  if (coupon.applicablePlanIds.length === 0) return "All plans";
  return coupon.applicablePlanIds
    .map((id) => plans.find((p) => p.id === id)?.displayName ?? id)
    .join(", ");
}

function billingCycleLabel(cycle: "MONTHLY" | "ANNUAL" | null) {
  if (cycle === "MONTHLY") return "Monthly only";
  if (cycle === "ANNUAL") return "Annual only";
  return "Monthly & Annual";
}

export function CouponList({
  coupons,
  plans,
}: {
  coupons: CouponListItem[];
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleActive = async (coupon: CouponListItem) => {
    setPendingId(coupon.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to update coupon");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update coupon");
    } finally {
      setPendingId(null);
    }
  };

  const deleteCoupon = async (coupon: CouponListItem) => {
    if (
      !window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)
    )
      return;
    setPendingId(coupon.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to delete coupon");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setPendingId(null);
    }
  };

  if (coupons.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
        No coupons yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {coupons.map((coupon) => (
        <div
          key={coupon.id}
          className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-gray-900">
                {coupon.code}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  coupon.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {coupon.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                {discountSummary(coupon)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                {billingCycleLabel(coupon.billingCycle)}
              </span>
            </div>
            {coupon.description && (
              <p className="text-sm text-gray-600">{coupon.description}</p>
            )}
            <p className="text-xs text-gray-400">
              Applies to: {applicablePlansLabel(coupon, plans)} · Uses:{" "}
              {coupon.usesCount}
              {coupon.maxUses !== null ? `/${coupon.maxUses}` : ""} · Max per
              user: {coupon.maxUsesPerUser}
              {coupon.validUntil &&
                ` · Expires ${new Date(coupon.validUntil).toLocaleDateString()}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleActive(coupon)}
              disabled={pendingId === coupon.id}
              title={coupon.isActive ? "Deactivate" : "Activate"}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {coupon.isActive ? (
                <PowerOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Power className="w-4 h-4 text-green-600" />
              )}
            </button>
            <Link
              href={`/admin/coupons/${coupon.id}/edit`}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4 text-gray-500" />
            </Link>
            <button
              onClick={() => deleteCoupon(coupon)}
              disabled={pendingId === coupon.id}
              title="Delete"
              className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
