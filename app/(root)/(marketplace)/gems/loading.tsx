import { Skeleton } from "@/components/ui/skeleton";
import { ListingCardSkeleton } from "@/components/cards/CardSkeletons";

export default function GemsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <Skeleton className="w-8 h-8 rounded-lg mb-2" />
              <Skeleton className="h-5 w-16 mb-1.5" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Price range filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Skeleton className="h-4 w-12 mr-1" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>

        {/* Results row */}
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
