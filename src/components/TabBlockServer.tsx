import { getNewsForBlock, type SupportedLocale, type News } from '@/lib/payload-data'
import { TabBlock } from './TabBlock'
import type { Media } from '@/payload-types'

interface TabImage {
  image: string | Media
  caption?: string | null
  id?: string | null
}

interface TabRecord {
  recordType: 'richText' | 'image' | 'video' | 'imageCard'
  recordRichText?: string | Record<string, unknown> | null
  recordImage?: string | Media | null
  videoUrl?: string | null
  cardImage?: string | Media | null
  cardTitle?: string | null
  cardDescription?: string | null
  cardLink?: string | null
  id?: string | null
}

interface Tab {
  tabName: string
  contentType: 'richText' | 'news' | 'images' | 'records'
  richTextContent?: string | Record<string, unknown> | null
  newsSource?: 'latest' | 'byTag' | 'manual' | null
  newsTag?: string | { id: string; name: string } | null
  selectedNews?: (string | { id: string; title: string })[] | null
  newsLimit?: number | null
  images?: TabImage[] | null
  records?: TabRecord[] | null
  id?: string | null
}

interface TabBlockServerProps {
  tabs: Tab[]
  locale?: SupportedLocale
  draft?: boolean
}

// Transform tab news source to block content source format
function mapNewsSource(source?: string | null): 'all' | 'byTag' | 'manual' {
  switch (source) {
    case 'latest':
      return 'all'
    case 'byTag':
      return 'byTag'
    case 'manual':
      return 'manual'
    default:
      return 'all'
  }
}

/**
 * Server Component for Tab Block
 * Fetches news data for tabs with news content type
 */
export async function TabBlockServer({ tabs, locale = 'uk', draft = false }: TabBlockServerProps) {
  if (!tabs || tabs.length === 0) {
    return null
  }

  // Process tabs and fetch news for news content type tabs
  const enrichedTabs = await Promise.all(
    tabs.map(async (tab) => {
      if (tab.contentType !== 'news') {
        return tab
      }

      // Fetch news for this tab
      const newsItems = await getNewsForBlock(
        {
          contentSource: mapNewsSource(tab.newsSource),
          selectedTag: tab.newsTag ?? undefined,
          selectedNews: tab.selectedNews ?? undefined,
          limit: tab.newsLimit ?? 6,
        },
        locale,
        draft
      )

      // Return tab with fetched news data
      return {
        ...tab,
        fetchedNews: newsItems,
      }
    })
  )

  return <TabBlock tabs={enrichedTabs as Tab[]} />
}

// Re-export types for use in other components
export type { Tab, TabImage, TabRecord, News }
