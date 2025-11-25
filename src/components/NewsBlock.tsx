'use client'

import { NewsListMode } from './NewsListMode'
import { NewsCarouselMode } from './NewsCarouselMode'
import { NewsGridMode } from './NewsGridMode'

interface NewsBlockProps {
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
  newsItems: any[]
  allTags?: any[]
  locale?: string
}

export function NewsBlock({ block, newsItems, allTags, locale = 'uk' }: NewsBlockProps) {
  const {
    displayMode,
    enableSearch,
    enableFilters,
    enablePagination,
    itemsPerPage,
  } = block

  // Render based on display mode
  switch (displayMode) {
    case 'list':
      return (
        <NewsListMode
          newsItems={newsItems}
          allTags={allTags || []}
          enableSearch={enableSearch ?? true}
          enableFilters={enableFilters ?? true}
          enablePagination={enablePagination ?? true}
          itemsPerPage={itemsPerPage || 9}
          locale={locale}
        />
      )

    case 'carousel':
      return (
        <NewsCarouselMode
          newsItems={newsItems}
          locale={locale}
        />
      )

    case 'grid':
      return (
        <NewsGridMode
          newsItems={newsItems}
          locale={locale}
        />
      )

    default:
      return null
  }
}
