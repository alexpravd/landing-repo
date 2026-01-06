import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for locale pages
 * Displays while page content is being fetched
 */
export default function LocaleLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero section skeleton */}
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <Skeleton className="mx-auto mb-4 h-8 w-32" />
        <Skeleton className="mx-auto mb-4 h-12 w-3/4" />
        <Skeleton className="mx-auto h-6 w-2/3" />
      </div>

      {/* Content blocks skeleton */}
      <div className="space-y-8">
        {/* Cards grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-40 w-full rounded-md" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
