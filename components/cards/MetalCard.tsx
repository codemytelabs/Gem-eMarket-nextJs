import Link from "next/link";
import { ShieldCheck, Coins, MapPin, Scale } from "lucide-react";
import { ThumbnailMedia } from "./ThumbnailMedia";
import { NegotiateButton } from "@/components/listings/NegotiateButton";

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
  pricingType?: string | null;
  whatsappEnabled?: boolean | null;
  whatsappNumber?: string | null;
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
        <div className="mt-2 space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
            {listing.currency} {Number(listing.price).toLocaleString()}
            {listing.pricingType === "Negotiable" && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                Negotiable
              </span>
            )}
          </p>
          {listing.pricingType === "Negotiable" && (
            <NegotiateButton
              listingId={listing.id}
              listingSlug={listing.slug}
              listingTitle={listing.title}
              whatsappNumber={
                listing.whatsappEnabled ? listing.whatsappNumber : null
              }
              className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            />
          )}
        </div>
      </div>
    </Link>
  );
}
