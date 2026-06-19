import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Gem } from "lucide-react";

interface Props {
  params: Promise<{ shopSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug } = await params;
  const seller = await db.user.findUnique({
    where: { shopSlug },
    select: {
      name: true,
      shopMetaTitle: true,
      shopMetaDescription: true,
      shopBannerUrl: true,
    },
  });

  if (!seller) return { title: "Shop Not Found" };

  return {
    title: seller.shopMetaTitle ?? `${seller.name} — GemCeylon Seller`,
    description:
      seller.shopMetaDescription ??
      `Browse gems and jewellery from ${seller.name} on GemCeylon.`,
    openGraph: {
      title: seller.shopMetaTitle ?? seller.name,
      images: seller.shopBannerUrl ? [{ url: seller.shopBannerUrl }] : [],
    },
  };
}

export default async function ShopProfilePage({ params }: Props) {
  const { shopSlug } = await params;

  const seller = await db.user.findUnique({
    where: { shopSlug },
    include: {
      subscription: { include: { plan: true } },
      listings: {
        where: { status: "ACTIVE" },
        orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
        take: 24,
      },
    },
  });

  if (!seller || !seller.subscription?.plan.hasShopProfile) notFound();

  const plan = seller.subscription.plan;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl overflow-hidden">
        {seller.shopBannerUrl && (
          <Image
            src={seller.shopBannerUrl}
            alt="Shop banner"
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <div className="w-16 h-16 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-lg">
            {seller.avatarUrl ? (
              <Image
                src={seller.avatarUrl}
                alt={seller.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {seller.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{seller.name}</h1>
              {seller.isVerified && (
                <ShieldCheck className="w-5 h-5 text-blue-300" />
              )}
            </div>
            {seller.locationCity && (
              <div className="flex items-center gap-1 text-sm text-white/80 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {seller.locationCity}, Sri Lanka
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
              plan.name === "dealer"
                ? "bg-amber-500 text-white"
                : plan.name === "pro"
                  ? "bg-purple-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            {plan.displayName} Seller
          </span>
        </div>
      </div>

      {/* Specialties + Bio */}
      {(seller.specialties.length > 0 || seller.shopBio) && (
        <div className="space-y-4">
          {seller.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {seller.specialties.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                >
                  <Gem className="w-3.5 h-3.5" />
                  {s}
                </span>
              ))}
            </div>
          )}
          {seller.shopBio && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
              {seller.shopBio}
            </p>
          )}
        </div>
      )}

      {/* Listings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          Active Listings ({seller.listings.length})
        </h2>
        {seller.listings.length === 0 ? (
          <p className="text-gray-500 text-sm">No active listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seller.listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gem className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {listing.isBoosted && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {listing.title}
                  </p>
                  {listing.caratWeight && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {Number(listing.caratWeight)} ct
                    </p>
                  )}
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    {listing.currency} {Number(listing.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
