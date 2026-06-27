interface SkeletonProps {
  className?: string;
  // For placement on dark/colored backgrounds (e.g. the homepage hero
  // gradient) where the default shimmer gradient's own background would
  // just paint over a bg-white/* override and look identical to the page.
  light?: boolean;
}

export function Skeleton({ className = "", light = false }: SkeletonProps) {
  if (light) {
    return (
      <div className={`bg-white/20 animate-pulse rounded-md ${className}`} />
    );
  }
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}
