"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlanOption {
  id: string;
  displayName: string;
}

interface CouponFormData {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
  discountValue: string;
  applicablePlanIds: string[];
  billingCycle: "" | "MONTHLY" | "ANNUAL";
  maxUses: string;
  maxUsesPerUser: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const DISCOUNT_HINTS: Record<CouponFormData["discountType"], string> = {
  PERCENTAGE: "Percentage off the price (0-100), e.g. 50 = 50% off",
  FIXED_USD: "Flat amount off the price, in USD",
  FREE_MONTHS: "Number of additional free months added to the subscription",
};

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface CouponFormProps {
  planOptions: PlanOption[];
  couponId?: string;
  initialData?: {
    code: string;
    description?: string | null;
    discountType: "PERCENTAGE" | "FIXED_USD" | "FREE_MONTHS";
    discountValue: number;
    applicablePlanIds: string[];
    billingCycle: "MONTHLY" | "ANNUAL" | null;
    maxUses: number | null;
    maxUsesPerUser: number;
    validFrom?: string | null;
    validUntil?: string | null;
    isActive: boolean;
  };
}

export function CouponForm({
  planOptions,
  couponId,
  initialData,
}: CouponFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CouponFormData>({
    code: initialData?.code ?? "",
    description: initialData?.description ?? "",
    discountType: initialData?.discountType ?? "PERCENTAGE",
    discountValue: initialData ? String(initialData.discountValue) : "",
    applicablePlanIds: initialData?.applicablePlanIds ?? [],
    billingCycle: initialData?.billingCycle ?? "",
    maxUses: initialData?.maxUses != null ? String(initialData.maxUses) : "",
    maxUsesPerUser: initialData ? String(initialData.maxUsesPerUser) : "1",
    validFrom: toDateInputValue(initialData?.validFrom),
    validUntil: toDateInputValue(initialData?.validUntil),
    isActive: initialData?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePlan = (planId: string) => {
    setForm((prev) => ({
      ...prev,
      applicablePlanIds: prev.applicablePlanIds.includes(planId)
        ? prev.applicablePlanIds.filter((id) => id !== planId)
        : [...prev.applicablePlanIds, planId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      applicablePlanIds: form.applicablePlanIds,
      billingCycle: form.billingCycle === "" ? null : form.billingCycle,
      maxUses: form.maxUses === "" ? null : Number(form.maxUses),
      maxUsesPerUser: Number(form.maxUsesPerUser),
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil
        ? new Date(form.validUntil).toISOString()
        : null,
      isActive: form.isActive,
    };

    try {
      const url = couponId
        ? `/api/admin/coupons/${couponId}`
        : "/api/admin/coupons";
      const method = couponId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to save coupon");
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 max-w-2xl"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Coupon code"
          placeholder="e.g. WELCOME50"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value.toUpperCase() })
          }
          required
        />
        <Input
          label="Description"
          placeholder="e.g. 50% off all plans"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount type
          </label>
          <select
            value={form.discountType}
            onChange={(e) =>
              setForm({
                ...form,
                discountType: e.target.value as CouponFormData["discountType"],
              })
            }
            className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_USD">Fixed amount (USD)</option>
            <option value="FREE_MONTHS">Free months</option>
          </select>
        </div>
        <Input
          label="Discount value"
          type="number"
          min={0}
          max={form.discountType === "PERCENTAGE" ? 100 : undefined}
          step={form.discountType === "FREE_MONTHS" ? 1 : "0.01"}
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
          helperText={DISCOUNT_HINTS[form.discountType]}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billing cycle
        </label>
        <select
          value={form.billingCycle}
          onChange={(e) =>
            setForm({
              ...form,
              billingCycle: e.target.value as CouponFormData["billingCycle"],
            })
          }
          className="block w-full md:w-1/2 rounded-md border border-gray-300 py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Monthly & Annual (any)</option>
          <option value="MONTHLY">Monthly only</option>
          <option value="ANNUAL">Annual only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Applicable plans
        </label>
        <div className="space-y-2 border border-gray-200 rounded-lg p-3">
          {planOptions.map((plan) => (
            <label
              key={plan.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={form.applicablePlanIds.includes(plan.id)}
                onChange={() => togglePlan(plan.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {plan.displayName}
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Leave all unchecked to apply this coupon to every plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Max total uses"
          type="number"
          min={1}
          placeholder="Unlimited"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          helperText="Leave blank for unlimited uses"
        />
        <Input
          label="Max uses per user"
          type="number"
          min={1}
          value={form.maxUsesPerUser}
          onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valid from"
          type="date"
          value={form.validFrom}
          onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          helperText="Leave blank for no start restriction"
        />
        <Input
          label="Valid until"
          type="date"
          value={form.validUntil}
          onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          helperText="Leave blank for no expiry"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Active
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" isLoading={saving}>
          {couponId ? "Save changes" : "Create coupon"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/coupons")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
