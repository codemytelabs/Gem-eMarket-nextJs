import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Gem, MapPin } from "lucide-react";
import { cldTransform } from "@/lib/cloudinary-url";

interface GemCardListing {
  id: string;
  slug: string;
  title: string;
  images: string[];
  caratWeight?: unknown;
  gemOrigin?: string | null;
  currentLocation?: string | null;
  certificationBody?: string | null;
  currency: string;
  price: unknown;
  isBoosted: boolean;
  seller: {
    name: string;
    isVerified: boolean;
  };
}

export function GemCard({ listing }: { listing: GemCardListing }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
        {listing.images[0] ? (
          <Image
            src={cldTransform(listing.images[0], "f_auto,q_auto,w_400")}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gem className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {listing.isBoosted && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        {listing.certificationBody && (
          <span className="absolute top-2 right-2 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {listing.certificationBody}
          </span>
        )}

        {!!listing.caratWeight && (
          <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {Number(listing.caratWeight)} ct
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {listing.title}
        </p>

        {/* Origin / location row */}
        {(listing.gemOrigin || listing.currentLocation) && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {[listing.gemOrigin, listing.currentLocation]
                .filter(Boolean)
                .join(" · ")}
            </span>
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
        <p className="text-sm font-bold text-blue-600 mt-2">
          {listing.currency} {Number(listing.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
