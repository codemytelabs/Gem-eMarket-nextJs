import { Skeleton } from "@/components/ui/skeleton";
import {
  ListingCardSkeleton,
  SellerCardSkeleton,
  BlogCardSkeleton,
} from "@/components/cards/CardSkeletons";

export function MetalPricesSkeleton() {
  return (
    <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedAndNewArrivalsSkeleton() {
  return (
    <>
      <section className="bg-gradient-to-b from-amber-50 to-gray-50 dark:from-amber-950/15 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}

export function FeaturedShopsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SellerCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function TrustBandSkeleton() {
  return (
    <section className="bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton light className="h-6 w-16" />
            <Skeleton light className="h-3 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlogSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
