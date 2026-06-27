import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCardSkeleton } from "@/components/cards/CardSkeletons";

export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        <Skeleton className="h-4 w-32 mb-5" />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
