"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Store,
  LayoutGrid,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  AtSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShoppingBag,
  X,
} from "lucide-react";
import { COUNTRIES, getDialCode, type Country } from "@/lib/utils/countries";
import { categories as navCategories } from "@/config/const/navLinks";

// ── Steps ─────────────────────────────────────────────────────────────────────
// Effective path by type:
//   Individual Seller: 1 → 2 → 4 (confirm)
//   Shop:              1 → 2 → 3 (categories) → 4* (shop profile, skippable) → 5 (confirm)
//   We keep IDs fixed; navigation skips steps based on type.

const STEPS = [
  { id: 1, label: "Your Details", icon: User },
  { id: 2, label: "Account Type", icon: Store },
  { id: 3, label: "Categories", icon: LayoutGrid, shopOnly: true },
  {
    id: 4,
    label: "Shop Profile",
    icon: ShoppingBag,
    shopOnly: true,
    optional: true,
  },
  { id: 5, label: "Confirm", icon: CheckCircle },
];

// ── Sell categories from nav (exclude "Sellers" meta-category) ───────────────
const SELL_CATEGORIES = navCategories
  .filter((c) => c.id !== "sellers")
  .map((c) => ({
    id: c.id,
    name: c.name,
    items: c.subcategories
      .filter((s) => s.id !== "all")
      .map((s) => ({ id: s.id, name: s.name.replace(/&apos;/g, "'") })),
  }));

type SellerType = "seller" | "shop" | null;

interface Props {
  name: string;
  email: string;
  phone: string | null;
  savedCountry: string;
  savedCity: string;
}

export function SellerRegistrationWizard({
  name,
  email,
  phone,
  savedCountry,
  savedCity,
}: Props) {
  const { update: updateSession } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — personal info
  const [sellerName, setSellerName] = useState(name);
  // Phone: split dial code from saved phone if possible
  const savedDial = getDialCode(savedCountry) || "+94";
  const savedLocal = phone?.startsWith(savedDial)
    ? phone.slice(savedDial.length).trim()
    : (phone ?? "");
  const [dialCode, setDialCode] = useState(savedDial);
  const [phoneLocal, setPhoneLocal] = useState(savedLocal);
  const [whatsappLocal, setWhatsappLocal] = useState(savedLocal);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    COUNTRIES.find((c) => c.code === savedCountry),
  );

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find((x) => x.code === code);
    setSelectedCountry(c);
    setDialCode(c?.dialCode ?? "+94");
  };

  // Step 2 — account type
  const [sellerType, setSellerType] = useState<SellerType>(null);

  // Step 3 — categories (Shop only)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(
    SELL_CATEGORIES[0]?.id ?? null,
  );

  const toggleItem = (n: string) =>
    setSelectedItems((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );

  // Step 4 — shop profile (Shop only, skippable)
  const [shopSlug, setShopSlug] = useState("");
  const [shopBio, setShopBio] = useState("");
  const [slugError, setSlugError] = useState("");
  const [step4Skipped, setStep4Skipped] = useState(false);

  // Step 5 — terms
  const [agreed, setAgreed] = useState(false);

  // ── Navigation helpers ─────────────────────────────────────────────────────

  // Steps that actually apply for the current seller type
  const activeSteps = (type: SellerType) =>
    type === "shop" ? [1, 2, 3, 4, 5] : [1, 2, 5];

  const nextStep = (current: number) => {
    const seq = activeSteps(sellerType);
    const idx = seq.indexOf(current);
    return idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : current;
  };

  const prevStep = (current: number) => {
    const seq = activeSteps(sellerType);
    const idx = seq.indexOf(current);
    return idx > 0 ? seq[idx - 1] : current;
  };

  const slugify = (v: string) =>
    v
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSlugInput = (v: string) => {
    const clean = slugify(v);
    setShopSlug(clean);
    setSlugError(
      clean.length > 0 && clean.length < 3
        ? "Shop URL must be at least 3 characters"
        : "",
    );
  };

  const canContinue = () => {
    if (step === 1) return sellerName.trim().length >= 2;
    if (step === 2) return sellerType !== null;
    if (step === 3) return true; // categories optional
    if (step === 4) return step4Skipped || (shopSlug.length >= 3 && !slugError);
    if (step === 5) return agreed;
    return false;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const fullPhone = phoneLocal ? `${dialCode} ${phoneLocal}` : undefined;
      const fullWhatsapp = whatsappLocal
        ? `${dialCode} ${whatsappLocal}`
        : undefined;

      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sellerName,
          phone: fullPhone,
          whatsappNumber: fullWhatsapp,
          locationCity: savedCity || undefined,
          shopSlug:
            sellerType === "shop" && !step4Skipped && shopSlug
              ? shopSlug
              : undefined,
          shopBio:
            sellerType === "shop" && !step4Skipped && shopBio
              ? shopBio
              : undefined,
          specialties: sellerType === "shop" ? selectedItems : [],
          agreeToTerms: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Re-write the JWT with the new SELLER role before navigating.
      // updateSession() POSTs to /api/auth/session → triggers jwt callback
      // with trigger:"update" → re-reads role from DB → sets new cookie.
      // We then hard-navigate (window.location) so the browser loads the new
      // page with the fresh cookie, guaranteeing every component sees SELLER.
      await updateSession();

      const dest =
        sellerType === "shop"
          ? "/subscription?from=seller-registration"
          : "/dashboard?welcome=1";
      window.location.href = dest;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  // ── Stepper ────────────────────────────────────────────────────────────────

  const isActive = (id: number) => step === id;
  const isDone = (id: number) =>
    sellerType === "shop"
      ? step > id
      : !STEPS.find((s) => s.id === id)?.shopOnly && step > id;
  const isSkipped = (id: number) =>
    !!STEPS.find((s) => s.id === id)?.shopOnly && sellerType === "seller";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Become a Seller
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start selling gems, jewellery, and services on the marketplace
            today.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-start justify-center mb-10">
          {STEPS.map((s, i) => {
            const done = isDone(s.id);
            const active = isActive(s.id);
            const skipped = isSkipped(s.id);
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      skipped
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600"
                        : done
                          ? "bg-blue-600 text-white"
                          : active
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium hidden sm:block text-center max-w-[60px] leading-tight ${
                      skipped
                        ? "text-gray-300 dark:text-gray-600"
                        : active
                          ? "text-blue-600"
                          : done
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-gray-400"
                    }`}
                  >
                    {s.label}
                    {s.optional && !skipped && (
                      <span className="block text-gray-300 dark:text-gray-600 text-[10px]">
                        optional
                      </span>
                    )}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-10 sm:w-14 h-0.5 mx-1 mb-5 transition-all ${step > s.id ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          {/* ── Step 1: Your Details ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pre-filled from your account — confirm or update below.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <AtSign className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs text-blue-500 font-medium">
                    Account Email (read-only)
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry?.code ?? "LK"}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full appearance-none border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 pr-10 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Phone className="inline w-3.5 h-3.5 mr-1" />
                    Phone
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {dialCode}
                    </span>
                    <input
                      type="tel"
                      value={phoneLocal}
                      onChange={(e) =>
                        setPhoneLocal(
                          e.target.value.replace(/[^0-9\s\-()]/g, ""),
                        )
                      }
                      placeholder="77 123 4567"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    WhatsApp{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      optional
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {dialCode}
                    </span>
                    <input
                      type="tel"
                      value={whatsappLocal}
                      onChange={(e) =>
                        setWhatsappLocal(
                          e.target.value.replace(/[^0-9\s\-()]/g, ""),
                        )
                      }
                      placeholder="77 123 4567"
                      className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Account Type ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  How do you want to sell?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose the account type that fits how you work. You can
                  upgrade any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Individual Seller */}
                <button
                  type="button"
                  onClick={() => setSellerType("seller")}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    sellerType === "seller"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${sellerType === "seller" ? "bg-blue-600" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <User
                      className={`w-5 h-5 ${sellerType === "seller" ? "text-white" : "text-gray-500"}`}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Individual Seller
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    Publish listings directly in the marketplace. Buyers find
                    your items through search and categories. Your name appears
                    on each listing as the seller.
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Free to start",
                      "Listings appear in search",
                      "Enquiries via listing",
                      "No plan required",
                    ].map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <span className="text-green-500 font-bold mt-0.5">
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                    <li className="flex items-start gap-1.5 text-xs text-gray-400 mt-2">
                      <span className="text-gray-300 font-bold mt-0.5">–</span>
                      No shop page — buyers can&apos;t browse all your items
                      together
                    </li>
                    <li className="flex items-start gap-1.5 text-xs text-gray-400">
                      <span className="text-gray-300 font-bold mt-0.5">–</span>
                      Not listed in the Sellers directory
                    </li>
                  </ul>
                  {sellerType === "seller" && (
                    <span className="mt-3 inline-block text-xs font-semibold text-blue-600">
                      Selected ✓
                    </span>
                  )}
                </button>

                {/* Shop */}
                <button
                  type="button"
                  onClick={() => setSellerType("shop")}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    sellerType === "shop"
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${sellerType === "shop" ? "bg-purple-600" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <Store
                      className={`w-5 h-5 ${sellerType === "shop" ? "text-white" : "text-gray-500"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Shop / Dealer
                    </h3>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Pro+
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    Get a dedicated shop page at{" "}
                    <span className="font-medium">/shop/your-name</span>. Buyers
                    browse your full catalogue in one place and find you in the
                    Sellers directory.
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Dedicated shop profile page",
                      "Listed in Sellers directory",
                      "Buyers browse your full catalogue",
                      "Shop badge on all listings",
                    ].map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                      >
                        <span className="text-purple-500 font-bold mt-0.5">
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                    <li className="flex items-start gap-1.5 text-xs text-gray-400 mt-2">
                      <span className="text-gray-300 font-bold mt-0.5">–</span>
                      Individual listings not indexed in standard search —
                      buyers reach you through your shop
                    </li>
                    <li className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                      <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                      Requires Pro or Dealer plan — you&apos;ll choose a plan
                      next
                    </li>
                  </ul>
                  {sellerType === "shop" && (
                    <span className="mt-3 inline-block text-xs font-semibold text-purple-600">
                      Selected ✓
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Categories (Shop only) ───────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  What does your shop sell?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Select the categories and products your shop deals in. This
                  helps buyers find your shop in the right section.
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                {SELL_CATEGORIES.map((cat) => {
                  const isOpen = expandedCat === cat.id;
                  const count = cat.items.filter((i) =>
                    selectedItems.includes(i.name),
                  ).length;
                  return (
                    <div key={cat.id}>
                      <button
                        type="button"
                        onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {cat.name}
                          </span>
                          {count > 0 && (
                            <span className="text-xs font-semibold bg-blue-600 text-white rounded-full px-1.5 py-0.5">
                              {count}
                            </span>
                          )}
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-gray-50/50 dark:bg-gray-800/30">
                          {cat.items.map((item) => {
                            const active = selectedItems.includes(item.name);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleItem(item.name)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                  active
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600"
                                }`}
                              >
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedItems.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full px-2.5 py-1"
                    >
                      {item}
                      <button type="button" onClick={() => toggleItem(item)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  You can skip and add categories later from your shop settings.
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Shop Profile (optional) ─────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shop Profile
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Set your shop URL and bio now, or skip and come back after
                    upgrading your plan.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                  Pro / Dealer
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">
                    Your public shop page requires a Pro or Dealer plan.
                  </span>{" "}
                  You will be guided to choose a plan after this step. Filling
                  in these details now means your shop page is ready the moment
                  you upgrade.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Shop URL{" "}
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    optional
                  </span>
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm border-r border-gray-300 dark:border-gray-700 whitespace-nowrap">
                    /shop/
                  </span>
                  <input
                    type="text"
                    value={shopSlug}
                    onChange={(e) => handleSlugInput(e.target.value)}
                    placeholder="your-shop-name"
                    className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                {slugError ? (
                  <p className="mt-1 text-xs text-red-500">{slugError}</p>
                ) : shopSlug ? (
                  <p className="mt-1 text-xs text-green-600">
                    Your shop:{" "}
                    <span className="font-medium">/shop/{shopSlug}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Lowercase letters, numbers and hyphens. e.g. ratnapura-gems
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Shop Bio{" "}
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    optional
                  </span>
                </label>
                <textarea
                  value={shopBio}
                  onChange={(e) => setShopBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell buyers about your shop — your experience, sourcing story, and what makes your gems special..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {shopBio.length}/500
                </p>
              </div>
            </div>
          )}

          {/* ── Step 5: Review & Confirm ─────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Review & Confirm
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Check your details and create your seller account.
                </p>
              </div>

              {sellerType === "shop" && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    <span className="font-semibold">
                      Next step after this: choose a Pro or Dealer plan
                    </span>{" "}
                    to activate your shop page. You can list items right away in
                    the meantime.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden text-sm">
                {[
                  { label: "Name", value: sellerName },
                  { label: "Email", value: email },
                  {
                    label: "Phone",
                    value: phoneLocal ? `${dialCode} ${phoneLocal}` : "—",
                  },
                  {
                    label: "WhatsApp",
                    value: whatsappLocal ? `${dialCode} ${whatsappLocal}` : "—",
                  },
                  {
                    label: "Account type",
                    value:
                      sellerType === "shop"
                        ? "Shop / Dealer"
                        : "Individual Seller",
                  },
                  {
                    label: "Country",
                    value: selectedCountry ? selectedCountry.name : "—",
                  },
                  { label: "City", value: savedCity || "—" },
                  ...(sellerType === "shop"
                    ? [
                        {
                          label: "Categories",
                          value:
                            selectedItems.length > 0
                              ? selectedItems.join(", ")
                              : "—",
                        },
                        ...(!step4Skipped && shopSlug
                          ? [{ label: "Shop URL", value: `/shop/${shopSlug}` }]
                          : []),
                      ]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 px-4 py-3">
                    <span className="w-28 shrink-0 font-medium text-gray-500 dark:text-gray-400">
                      {label}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200 break-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{" "}
                  <a
                    href="/help-center/privacy-policy"
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and understand that my seller profile will be publicly visible
                  on the marketplace.
                </span>
              </label>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prevStep(step))}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step === 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep4Skipped(true);
                    setStep(nextStep(step));
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors"
                >
                  Skip for now
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep4Skipped(false);
                    setStep(nextStep(step));
                  }}
                  disabled={!canContinue()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canContinue() || loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {sellerType === "shop"
                        ? "Create Account & Choose Plan"
                        : "Create Seller Account"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
