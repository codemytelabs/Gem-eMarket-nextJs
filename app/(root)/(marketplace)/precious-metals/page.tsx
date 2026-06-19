export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Coins } from "lucide-react";
import { MetalCard } from "@/components/cards";

export const metadata: Metadata = {
  title: "Precious Metals — Gold, Silver & Platinum | GemCeylon",
  description:
    "Buy and sell precious metals from verified Sri Lankan dealers. Gold, silver, and platinum at competitive prices.",
};

interface Props {
  searchParams: Promise<{ metal?: string; q?: string; page?: string }>;
}

const METAL_FILTERS = [
  { value: "Gold 24K", label: "Gold 24K" },
  { value: "Gold 22K", label: "Gold 22K" },
  { value: "Gold 18K", label: "Gold 18K" },
  { value: "Silver", label: "Silver" },
  { value: "Platinum", label: "Platinum" },
  { value: "Palladium", label: "Palladium" },
];

export default async function PreciousMetalsPage({ searchParams }: Props) {
  const { metal, q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    category: "PRECIOUS_METAL",
  };
  if (metal) where.metalType = { contains: metal, mode: "insensitive" };
  if (q)
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      include: { seller: { select: { name: true, isVerified: true } } },
      orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.listing.count({ where }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Precious <span className="text-amber-500">Metals</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Gold, silver, and platinum from verified Sri Lankan dealers. All
            weights and purities.
          </p>
        </div>

        {/* Metal type filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            href="/precious-metals"
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !metal
                ? "bg-amber-500 text-white border-amber-500"
                : "border-gray-300 text-gray-600 hover:border-amber-400 dark:border-gray-600 dark:text-gray-400"
            }`}
          >
            All Metals
          </Link>
          {METAL_FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={`/precious-metals?metal=${encodeURIComponent(value)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                metal === value
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-gray-300 text-gray-600 hover:border-amber-400 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {total.toLocaleString()} listings found
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Coins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No precious metal listings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <MetalCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/precious-metals?page=${page - 1}${metal ? `&metal=${encodeURIComponent(metal)}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {page * limit < total && (
              <Link
                href={`/precious-metals?page=${page + 1}${metal ? `&metal=${encodeURIComponent(metal)}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
