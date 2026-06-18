export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Crown } from "lucide-react";
import { JewelleryCard } from "@/components/cards";

export const metadata: Metadata = {
  title: "Jewellery — Ceylon Gem Jewellery | GemCeylon",
  description:
    "Shop handcrafted jewellery featuring certified Ceylon gems from verified Sri Lankan jewellers.",
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function JewelleryPage({ searchParams }: Props) {
  const { q, page: pageStr } = await searchParams;
  const page = parseInt(pageStr ?? "1");
  const limit = 24;

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    category: "JEWELLERY",
  };
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Ceylon <span className="text-purple-600">Jewellery</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Handcrafted jewellery featuring certified Ceylon gems from verified
            Sri Lankan jewellers.
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {total.toLocaleString()} pieces found
        </p>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No jewellery listings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <JewelleryCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/jewellery?page=${page - 1}${q ? `&q=${q}` : ""}`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {page * limit < total && (
              <Link
                href={`/jewellery?page=${page + 1}${q ? `&q=${q}` : ""}`}
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
