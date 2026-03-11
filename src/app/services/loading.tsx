import { Skeleton } from "@/components/ui/Skeleton";

function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-48" rounded="md" />
        <Skeleton className="h-5 w-20" rounded="full" />
      </div>
      <Skeleton className="h-4 w-full" rounded="md" />
      <Skeleton className="h-4 w-11/12" rounded="md" />
      <Skeleton className="h-4 w-4/5" rounded="md" />
      <div className="flex flex-wrap gap-2 pt-1">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-24" rounded="full" />
        ))}
      </div>
    </div>
  );
}

export default function ServicesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading services">
      {/* Hero */}
      <div className="bg-[var(--blue-bg)] px-6 py-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <Skeleton className="h-5 w-48" rounded="full" />
          <Skeleton className="h-10 w-full max-w-lg" rounded="lg" />
          <Skeleton className="h-10 w-4/5 max-w-md" rounded="lg" />
          <Skeleton className="h-5 w-3/5 max-w-sm mt-2" rounded="md" />
        </div>
      </div>

      {/* Service cards */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
