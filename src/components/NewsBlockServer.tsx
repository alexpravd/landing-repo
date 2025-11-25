import { getNewsForBlock, getAllNewsTags, type SupportedLocale } from '@/lib/payload-data'
import { NewsBlock } from './NewsBlock'

interface NewsBlockServerProps {
  block: {
    displayMode: 'list' | 'carousel' | 'grid'
    contentSource: 'all' | 'byTag' | 'manual'
    selectedTag?: any
    selectedNews?: any[]
    limit?: number
    enableSearch?: boolean
    enableFilters?: boolean
    enablePagination?: boolean
    itemsPerPage?: number
  }
  locale?: SupportedLocale
  draft?: boolean
}

/**
 * Server Component for News Block
 * Fetches news data and renders the appropriate display mode
 */
export async function NewsBlockServer({ block, locale = 'uk', draft = false }: NewsBlockServerProps) {
  // Fetch news items based on block configuration
  const newsItems = await getNewsForBlock(
    {
      contentSource: block.contentSource,
      selectedTag: block.selectedTag,
      selectedNews: block.selectedNews,
      limit: block.limit,
    },
    locale,
    draft
  )

  // Fetch all tags for filters (only for list mode with filters enabled)
  const allTags =
    block.displayMode === 'list' && block.enableFilters
      ? await getAllNewsTags(locale, draft)
      : []

  // If no news items, return null or empty state
  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-600">No news articles available</p>
      </div>
    )
  }

  return <NewsBlock block={block} newsItems={newsItems} allTags={allTags} locale={locale} />
}
