export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Gem, Sparkles, Shield, Award } from "lucide-react";
import { GemCard } from "@/components/cards";

export const metadata: Metadata = {
  title: "Ceylon Gems — Buy Certified Sapphires, Rubies & More",
  description:
    "Browse certified Ceylon sapphires, rubies, cat's eye, and rare gems directly from verified Sri Lankan miners and dealers.",
};

interface Props {
  searchParams: Promise<{
    type?: string;
    q?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const PRICE_TIERS = [
  { label: "Under $500", min: undefined, max: 500 },
  { label: "$500 – $2,000", min: 500, max: 2000 },
  { label: "$2,000 – $10,000", min: 2000, max: 10000 },
  { label: "$10,000+", min: 10000, max: undefined },
] as const;

export default async function GemsPage({ searchParams }: Props) {
  const {
    type,
    q,
    page: pageStr,
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
  } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;

  const where: Prisma.ListingWhereInput = { status: "ACTIVE", category: "GEM" };
  if (type) where.gemType = { contains: type, mode: "insensitive" };
  if (q)
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { gemType: { contains: q, mode: "insensitive" } },
    ];
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  const priceTierHref = (min?: number, max?: number) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (q) params.set("q", q);
    if (min !== undefined) params.set("minPrice", String(min));
    if (max !== undefined) params.set("maxPrice", String(max));
    const qs = params.toString();
    return qs ? `/gems?${qs}` : "/gems";
  };

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      include: {
        seller: {
          select: {
            name: true,
            isVerified: true,
            locationCity: true,
            subscription: { select: { plan: { select: { name: true } } } },
          },
        },
      },
      orderBy: [
        { isBoosted: "desc" },
        { isFeaturedHomepage: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.listing.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Ceylon <span className="text-blue-600">Gemstones</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Certified sapphires, rubies, cat&apos;s eye and rare gems from
            verified Sri Lankan miners and dealers.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Active Gems",
              value: total.toLocaleString(),
              icon: Sparkles,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Certified",
              value: "GIA / AGL",
              icon: Shield,
              color: "text-green-600",
              bg: "bg-green-50 dark:bg-green-900/20",
            },
            {
              label: "Sri Lanka Origin",
              value: "100%",
              icon: Gem,
              color: "text-purple-600",
              bg: "bg-purple-50 dark:bg-purple-900/20",
            },
            {
              label: "Verified Sellers",
              value: "Trusted",
              icon: Award,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-900/20",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Price range filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
            Price:
          </span>
          {PRICE_TIERS.map((tier) => {
            const active = minPrice === tier.min && maxPrice === tier.max;
            return (
              <Link
                key={tier.label}
                href={priceTierHref(tier.min, tier.max)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {tier.label}
              </Link>
            );
          })}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <Link
              href={priceTierHref(undefined, undefined)}
              className="text-sm text-blue-600 hover:underline ml-1"
            >
              Reset price
            </Link>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total.toLocaleString()} gem{total !== 1 ? "s" : ""} found
            {q ? ` for "${q}"` : ""}
          </p>
          <Link href="/gems" className="text-sm text-blue-600 hover:underline">
            Clear filters
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Gem className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No gems found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <GemCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {(() => {
              const base = priceTierHref(minPrice, maxPrice);
              const sep = base.includes("?") ? "&" : "?";
              return (
                <>
                  {page > 1 && (
                    <Link
                      href={`${base}${sep}page=${page - 1}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      ← Previous
                    </Link>
                  )}
                  {page * limit < total && (
                    <Link
                      href={`${base}${sep}page=${page + 1}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
