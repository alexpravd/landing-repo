import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for news article pages
 * Matches the structure of NewsArticleRenderer
 */
export default function NewsArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Floating nav placeholder */}
      <div className="h-16" />

      <div className="container mx-auto px-4 py-12">
        {/* Article Header */}
        <header className="mx-auto mb-12 max-w-4xl">
          {/* Tags skeleton */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>

          {/* Title skeleton */}
          <Skeleton className="mb-4 h-12 w-full md:h-14" />
          <Skeleton className="mb-4 h-12 w-3/4 md:h-14" />

          {/* Excerpt skeleton */}
          <Skeleton className="mb-6 h-6 w-full" />
          <Skeleton className="mb-6 h-6 w-2/3" />

          {/* Metadata skeleton */}
          <div className="flex flex-wrap items-center gap-6 border-b border-t border-border py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </header>

        {/* Featured Image skeleton */}
        <div className="mx-auto mb-12 max-w-5xl">
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>

        {/* Content blocks skeleton */}
        <main className="mx-auto max-w-4xl space-y-8">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </main>
      </div>
    </div>
  )
}
