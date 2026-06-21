import Link from "next/link";
import { ShieldCheck, Coins, MapPin, Scale } from "lucide-react";
import { ThumbnailMedia } from "./ThumbnailMedia";

interface MetalCardListing {
  id: string;
  slug: string;
  title: string;
  images: string[];
  reelUrl?: string | null;
  metalType?: string | null;
  metalPurity?: string | null;
  weightGrams?: unknown;
  currentLocation?: string | null;
  currency: string;
  price: unknown;
  isBoosted: boolean;
  seller: {
    name: string;
    isVerified: boolean;
  };
}

export function MetalCard({ listing }: { listing: MetalCardListing }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
        {listing.reelUrl || listing.images[0] ? (
          <ThumbnailMedia
            images={listing.images}
            reelUrl={listing.reelUrl}
            alt={listing.title}
            transform="f_auto,q_auto,w_400"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Coins className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {listing.isBoosted && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        {/* Metal type + purity badge — prominent for metals */}
        {listing.metalType && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {listing.metalType}
            </span>
            {listing.metalPurity && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {listing.metalPurity}
              </span>
            )}
          </div>
        )}

        {/* Weight badge */}
        {!!listing.weightGrams && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Scale className="w-2.5 h-2.5" />
            {Number(listing.weightGrams).toLocaleString()} g
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
          {listing.title}
        </p>

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
        <p className="text-sm font-bold text-amber-600 mt-2">
          {listing.currency} {Number(listing.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
