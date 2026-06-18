import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Wrench, MapPin, Clock, ArrowRight } from "lucide-react";

interface ServiceCardListing {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  images: string[];
  serviceType?: string | null;
  pricingType?: string | null;
  turnaroundTime?: string | null;
  serviceArea?: string[];
  currentLocation?: string | null;
  currency: string;
  price: unknown;
  isBoosted: boolean;
  seller: {
    name: string;
    isVerified: boolean;
    locationCity?: string | null;
  };
}

export function ServiceCard({ listing }: { listing: ServiceCardListing }) {
  const areaLabel =
    listing.serviceArea && listing.serviceArea.length > 0
      ? listing.serviceArea.includes("Island-wide")
        ? "Island-wide"
        : listing.serviceArea.slice(0, 2).join(", ") +
          (listing.serviceArea.length > 2
            ? ` +${listing.serviceArea.length - 2}`
            : "")
      : (listing.currentLocation ?? null);

  const pricePrefix: Record<string, string> = {
    "Starting From": "From",
    "Per Hour": "From",
    "Per Item": "Per item",
    Negotiable: "",
    "Fixed Price": "",
  };
  const prefix = listing.pricingType
    ? (pricePrefix[listing.pricingType] ?? "")
    : "";

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg transition-all flex flex-col"
    >
      {/* Wide image */}
      <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Wrench className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {listing.isBoosted && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        {listing.serviceType && (
          <span className="absolute bottom-2 left-2 bg-green-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {listing.serviceType}
          </span>
        )}

        {listing.pricingType === "Negotiable" && (
          <span className="absolute top-2 right-2 bg-gray-700/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            Negotiable
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-snug">
          {listing.title}
        </p>

        {listing.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-gray-400">
          {listing.turnaroundTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {listing.turnaroundTime}
            </span>
          )}
          {areaLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {areaLabel}
            </span>
          )}
        </div>

        {/* Seller row */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-500 truncate">
            {listing.seller.name}
          </span>
          {listing.seller.isVerified && (
            <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm font-bold text-green-600">
            {prefix && (
              <span className="font-normal text-gray-500 mr-1">{prefix}</span>
            )}
            {listing.pricingType === "Negotiable"
              ? "Get a quote"
              : `${listing.currency} ${Number(listing.price).toLocaleString()}`}
          </p>
          <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium group-hover:gap-1.5 transition-all">
            Enquire <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
