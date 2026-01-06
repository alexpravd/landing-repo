import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for dynamic pages
 * Generic structure for block-based content pages
 */
export default function DynamicPageLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page header skeleton */}
      <div className="mx-auto mb-12 max-w-4xl">
        <Skeleton className="mx-auto mb-4 h-10 w-2/3" />
        <Skeleton className="mx-auto h-6 w-1/2" />
      </div>

      {/* Content blocks skeleton */}
      <div className="space-y-12">
        {/* Section header skeleton */}
        <div className="text-center">
          <Skeleton className="mx-auto mb-2 h-6 w-24" />
          <Skeleton className="mx-auto mb-4 h-10 w-1/2" />
          <Skeleton className="mx-auto h-5 w-2/3" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-48 w-full rounded-md" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>

        {/* Text content skeleton */}
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}
