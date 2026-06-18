import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Crown, MapPin } from "lucide-react";

interface JewelleryCardListing {
  id: string;
  slug: string;
  title: string;
  images: string[];
  jewelleryType?: string | null;
  metalType?: string | null;
  metalPurity?: string | null;
  gemType?: string | null;
  currentLocation?: string | null;
  currency: string;
  price: unknown;
  isBoosted: boolean;
  seller: {
    name: string;
    isVerified: boolean;
  };
}

export function JewelleryCard({ listing }: { listing: JewelleryCardListing }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all"
    >
      {/* Image */}
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
            <Crown className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {listing.isBoosted && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        {listing.jewelleryType && (
          <span className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {listing.jewelleryType}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
          {listing.title}
        </p>

        {/* Metal + gem row */}
        {(listing.metalType || listing.gemType) && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {listing.metalType && (
              <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">
                {listing.metalType}
                {listing.metalPurity ? ` · ${listing.metalPurity}` : ""}
              </span>
            )}
            {listing.gemType && (
              <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                {listing.gemType}
              </span>
            )}
          </div>
        )}

        {/* Location row */}
        {listing.currentLocation && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{listing.currentLocation}</span>
          </div>
        )}

        {/* Seller row */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-xs text-gray-500 truncate">
            {listing.seller.name}
          </span>
          {listing.seller.isVerified && (
            <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
          )}
        </div>

        {/* Price */}
        <p className="text-sm font-bold text-purple-600 mt-2">
          {listing.currency} {Number(listing.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
