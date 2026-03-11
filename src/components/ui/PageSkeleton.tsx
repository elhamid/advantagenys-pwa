import { Skeleton } from "./Skeleton";

export function PageSkeleton() {
  return (
    <div className="w-full animate-pulse" aria-busy="true" aria-label="Loading page">
      {/* Hero block */}
      <div className="bg-[var(--blue-bg)] px-6 py-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <Skeleton className="h-5 w-40" rounded="full" />
          <Skeleton className="h-10 w-full max-w-xl" rounded="lg" />
          <Skeleton className="h-10 w-4/5 max-w-lg" rounded="lg" />
          <Skeleton className="h-5 w-3/5 max-w-md mt-2" rounded="md" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-12 w-36" rounded="lg" />
            <Skeleton className="h-12 w-36" rounded="lg" />
          </div>
        </div>
      </div>

      {/* Content blocks */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        {/* Row of cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-6 space-y-3 shadow-sm">
              <Skeleton className="h-6 w-2/3" rounded="md" />
              <Skeleton className="h-4 w-full" rounded="md" />
              <Skeleton className="h-4 w-5/6" rounded="md" />
              <Skeleton className="h-4 w-4/6" rounded="md" />
            </div>
          ))}
        </div>

        {/* Wide content block */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/3" rounded="md" />
          <Skeleton className="h-4 w-full" rounded="md" />
          <Skeleton className="h-4 w-11/12" rounded="md" />
          <Skeleton className="h-4 w-4/5" rounded="md" />
        </div>

        {/* Another row of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-6 space-y-3 shadow-sm">
              <Skeleton className="h-5 w-1/2" rounded="md" />
              <Skeleton className="h-4 w-full" rounded="md" />
              <Skeleton className="h-4 w-3/4" rounded="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
