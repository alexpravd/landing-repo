import { cache } from 'react'
import { getPayload } from '@/lib/payload'
import type {
  Page as PayloadPage,
  News as PayloadNews,
  NewsTag as PayloadNewsTag,
} from '@/payload-types'

export type SupportedLocale = 'uk' | 'en'

// Re-export types for external usage
export type Page = PayloadPage
export type News = PayloadNews
export type NewsTag = PayloadNewsTag

// Reserved for future use
// interface GetSiteDataOptions {
//   locale?: SupportedLocale
//   draft?: boolean
// }

// Raw navigation doc from Payload CMS
interface NavigationDoc {
  id: string
  label?: string
  linkType?: string
  page?: { slug?: string } | null
  href?: string
  openInNewTab?: boolean
  children?: Array<{
    label?: string
    items?: Array<{
      label?: string
      linkType?: string
      page?: { slug?: string } | null
      href?: string
      openInNewTab?: boolean
    }>
  }>
}

// Types matching the 3-level CMS structure (exported for Header component)
export interface NavigationItem {
  id: string
  label: string
  href?: string
  linkType?: 'none' | 'page' | 'custom'
  page?: { slug?: string } | null
  openInNewTab?: boolean
  children?: Array<{
    id: string
    label?: string
    items?: Array<{
      id: string
      label?: string
      href?: string
      linkType?: 'page' | 'custom'
      page?: { slug?: string } | null
      openInNewTab?: boolean
    }>
  }>
}

interface SocialLink {
  platform:
    | 'facebook'
    | 'twitter'
    | 'instagram'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'github'
    | 'discord'
  url: string
  openInNewTab?: boolean
}

interface SiteSettings {
  siteTitle: string
  siteLogo?: {
    url: string
    alt?: string
  }
  logoAltText?: string
  tagline?: string
  socialLinks?: SocialLink[]
}

interface ContactItem {
  icon: 'location' | 'phone' | 'email' | 'fax' | 'time' | 'link'
  label: string
  href?: string
  openInNewTab?: boolean
}

interface ContactColumn {
  title: string
  items?: ContactItem[]
}

interface FooterData {
  copyrightText?: string
  description?: string
  links?: Array<{
    label: string
    href: string
    openInNewTab?: boolean
  }>
  contactColumns?: ContactColumn[]
}

/**
 * Fetch the home page
 * Wrapped with React cache() to deduplicate requests within the same render
 */
export const getHomePage = cache(
  async (locale: SupportedLocale = 'uk', draft: boolean = false): Promise<PayloadPage | null> => {
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'pages',
      where: {
        pageType: {
          equals: 'home',
        },
        ...(draft
          ? {}
          : {
              status: {
                equals: 'published',
              },
            }),
      },
      locale,
      limit: 1,
      draft,
    })

    return (result.docs[0] as PayloadPage) || null
  }
)

/**
 * Fetch a page by slug
 * Wrapped with React cache() to deduplicate requests within the same render
 */
export const getPageBySlug = cache(
  async (
    slug: string,
    locale: SupportedLocale = 'uk',
    draft: boolean = false
  ): Promise<PayloadPage | null> => {
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: slug,
        },
        ...(draft
          ? {}
          : {
              status: {
                equals: 'published',
              },
            }),
      },
      locale,
      limit: 1,
      draft,
    })

    return (result.docs[0] as PayloadPage) || null
  }
)

/**
 * Fetch a news article by slug
 * Wrapped with React cache() to deduplicate requests within the same render
 */
export const getNewsBySlug = cache(
  async (
    slug: string,
    locale: SupportedLocale = 'uk',
    draft: boolean = false
  ): Promise<PayloadNews | null> => {
    const payload = await getPayload()

    const result = await payload.find({
      collection: 'news',
      where: {
        slug: {
          equals: slug,
        },
        ...(draft
          ? {}
          : {
              status: {
                equals: 'published',
              },
            }),
      },
      locale,
      limit: 1,
      draft,
      depth: 1, // Reduced from 2 - include direct relations only
    })

    return (result.docs[0] as PayloadNews) || null
  }
)

/**
 * Fetch all news articles (for listing pages)
 * Optimized with reduced depth and select for required fields only
 */
export async function getAllNews(
  locale: SupportedLocale = 'uk',
  draft: boolean = false,
  limit: number = 10,
  page: number = 1
): Promise<{
  docs: PayloadNews[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number | undefined
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null | undefined
  nextPage: number | null | undefined
}> {
  const payload = await getPayload()

  const result = await payload.find({
    collection: 'news',
    where: draft
      ? {}
      : {
          status: {
            equals: 'published',
          },
        },
    locale,
    limit,
    page,
    sort: '-publishedDate', // Most recent first
    draft,
    depth: 1, // Reduced from 2 - direct relations only
  })

  return {
    docs: result.docs as PayloadNews[],
    totalDocs: result.totalDocs,
    limit: result.limit,
    totalPages: result.totalPages,
    page: result.page,
    pagingCounter: result.pagingCounter,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
  }
}

/**
 * Fetch news for a news block based on configuration
 * Optimized with reduced depth for listing displays
 */
export async function getNewsForBlock(
  blockConfig: {
    contentSource: 'all' | 'byTag' | 'manual'
    selectedTag?: string | { id: string }
    selectedNews?: Array<string | { id: string }>
    limit?: number
  },
  locale: SupportedLocale = 'uk',
  draft: boolean = false
): Promise<PayloadNews[]> {
  const payload = await getPayload()

  // Manual selection
  if (blockConfig.contentSource === 'manual' && blockConfig.selectedNews) {
    const newsIds = blockConfig.selectedNews.map((item) =>
      typeof item === 'string' ? item : item.id
    )

    if (newsIds.length === 0) return []

    const result = await payload.find({
      collection: 'news',
      where: {
        id: {
          in: newsIds,
        },
        ...(draft
          ? {}
          : {
              status: {
                equals: 'published',
              },
            }),
      },
      locale,
      depth: 1, // Reduced from 2
      draft,
    })

    // Maintain manual order
    const orderedDocs = newsIds
      .map((id) => result.docs.find((doc) => doc.id === id))
      .filter((doc): doc is PayloadNews => doc !== undefined)

    return orderedDocs as PayloadNews[]
  }

  // By tag
  if (blockConfig.contentSource === 'byTag' && blockConfig.selectedTag) {
    const tagId =
      typeof blockConfig.selectedTag === 'string'
        ? blockConfig.selectedTag
        : blockConfig.selectedTag.id

    const result = await payload.find({
      collection: 'news',
      where: {
        tags: {
          in: [tagId],
        },
        ...(draft
          ? {}
          : {
              status: {
                equals: 'published',
              },
            }),
      },
      locale,
      limit: blockConfig.limit || 10,
      sort: '-publishedDate',
      depth: 1, // Reduced from 2
      draft,
    })

    return result.docs as PayloadNews[]
  }

  // All news (default)
  const result = await payload.find({
    collection: 'news',
    where: draft
      ? {}
      : {
          status: {
            equals: 'published',
          },
        },
    locale,
    limit: blockConfig.limit || 10,
    sort: '-publishedDate',
    depth: 1, // Reduced from 2
    draft,
  })

  return result.docs as PayloadNews[]
}

/**
 * Get all news tags
 */
export async function getAllNewsTags(
  locale: SupportedLocale = 'uk',
  draft: boolean = false
): Promise<PayloadNewsTag[]> {
  const payload = await getPayload()

  const result = await payload.find({
    collection: 'news-tags',
    locale,
    limit: 100,
    sort: 'name',
    draft,
  })

  return result.docs as PayloadNewsTag[]
}

/**
 * Fetch site-wide data (settings, navigation, footer)
 * Wrapped with React cache() to deduplicate requests within the same render
 */
export const getSiteData = cache(async (locale: SupportedLocale = 'uk', draft: boolean = false) => {
  const payload = await getPayload()

  // Fetch site settings global with locale and draft status
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    draft,
  })

  // Fetch navigation items with locale and draft status
  // Include page relationship depth to get page slugs
  const navigationResult = await payload.find({
    collection: 'navigation',
    locale,
    limit: 100,
    sort: 'order',
    draft,
    depth: 1, // Reduced from 2 - include direct page relations only
  })

  // Fetch footer data with locale and draft status
  const footerData = await payload.findGlobal({
    slug: 'footer',
    locale,
    draft,
  })

  // Transform site settings with proper null checks
  // Return undefined if no siteTitle to let components use defaults
  const siteSettings: SiteSettings | undefined = settings?.siteTitle
    ? {
        siteTitle: settings.siteTitle,
        siteLogo:
          settings.siteLogo && typeof settings.siteLogo === 'object' && 'url' in settings.siteLogo
            ? {
                url: settings.siteLogo.url as string,
                alt: settings.logoAltText || undefined,
              }
            : undefined,
        logoAltText: settings.logoAltText || undefined,
        tagline: settings.tagline || undefined,
        socialLinks: settings.socialLinks || undefined,
      }
    : undefined

  // Helper function to resolve href from page relationship or custom URL
  const resolveHref = (
    linkType: string,
    page: { slug?: string } | null | undefined,
    customHref: string | undefined,
    locale: string
  ): string | undefined => {
    if (linkType === 'page' && page) {
      // If page is an object with slug, use it
      if (typeof page === 'object' && page.slug) {
        return `/${locale}/${page.slug}`
      }
    }
    if (linkType === 'custom' && customHref) {
      return customHref
    }
    return undefined
  }

  // Transform navigation items - 3-level structure with page references
  const navigationItems: NavigationItem[] | undefined =
    navigationResult.docs.length > 0
      ? (navigationResult.docs as NavigationDoc[])
          .filter((doc) => doc.label)
          .map((doc) => ({
            id: doc.id,
            label: doc.label as string,
            linkType: (doc.linkType as 'none' | 'page' | 'custom') || undefined,
            page: doc.page,
            href: resolveHref(doc.linkType || '', doc.page, doc.href, locale),
            openInNewTab: doc.openInNewTab,
            children: doc.children?.map((child, childIndex) => ({
              id: `${doc.id}-child-${childIndex}`,
              label: child.label,
              items: child.items?.map((item, itemIndex) => ({
                id: `${doc.id}-child-${childIndex}-item-${itemIndex}`,
                label: item.label,
                linkType: (item.linkType as 'page' | 'custom') || undefined,
                page: item.page,
                href: resolveHref(item.linkType || '', item.page, item.href, locale),
                openInNewTab: item.openInNewTab,
              })),
            })),
          }))
      : undefined

  // Transform footer data - return undefined if no data
  const footer: FooterData | undefined =
    footerData &&
    (footerData.copyrightText ||
      footerData.description ||
      footerData.links ||
      footerData.contactColumns)
      ? {
          copyrightText: footerData.copyrightText || undefined,
          description: footerData.description || undefined,
          links: footerData.links || undefined,
          contactColumns: footerData.contactColumns || undefined,
        }
      : undefined

  return {
    siteSettings,
    navigationItems,
    footer,
  }
})

/**
 * Get all published page slugs for generateStaticParams
 * Returns an array of slugs for static generation
 */
export async function getAllPublishedPageSlugs(): Promise<string[]> {
  const payload = await getPayload()

  const result = await payload.find({
    collection: 'pages',
    where: {
      status: {
        equals: 'published',
      },
      // Exclude home pages as they don't use slug routes
      pageType: {
        not_equals: 'home',
      },
    },
    limit: 1000, // Reasonable limit for static generation
    depth: 0, // No relations needed, just slugs
  })

  return result.docs
    .map((doc) => doc.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
}

/**
 * Get all published news slugs for generateStaticParams
 * Returns an array of slugs for static generation
 */
export async function getAllPublishedNewsSlugs(): Promise<string[]> {
  const payload = await getPayload()

  const result = await payload.find({
    collection: 'news',
    where: {
      status: {
        equals: 'published',
      },
    },
    limit: 1000, // Reasonable limit for static generation
    depth: 0, // No relations needed, just slugs
  })

  return result.docs
    .map((doc) => doc.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
}
