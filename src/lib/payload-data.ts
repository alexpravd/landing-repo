import { getPayload } from 'payload'
import config from '@payload-config'

export type SupportedLocale = 'uk' | 'en' | 'es'

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

// Types matching the 3-level CMS structure
interface NavigationItem {
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
 */
export async function getHomePage(locale: SupportedLocale = 'uk', draft: boolean = false) {
  const payload = await getPayload({ config })

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

  return result.docs[0] || null
}

/**
 * Fetch a page by slug
 */
export async function getPageBySlug(
  slug: string,
  locale: SupportedLocale = 'uk',
  draft: boolean = false
) {
  const payload = await getPayload({ config })

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

  return result.docs[0] || null
}

/**
 * Fetch a news article by slug
 */
export async function getNewsBySlug(
  slug: string,
  locale: SupportedLocale = 'uk',
  draft: boolean = false
) {
  const payload = await getPayload({ config })

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
    depth: 2, // Include related data (tags, author, images)
  })

  return result.docs[0] || null
}

/**
 * Fetch all news articles (for listing pages)
 */
export async function getAllNews(
  locale: SupportedLocale = 'uk',
  draft: boolean = false,
  limit: number = 10,
  page: number = 1
) {
  const payload = await getPayload({ config })

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
    depth: 2, // Include related data
  })

  return {
    docs: result.docs,
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
) {
  const payload = await getPayload({ config })

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
      depth: 2,
      draft,
    })

    // Maintain manual order
    const orderedDocs = newsIds
      .map((id) => result.docs.find((doc) => doc.id === id))
      .filter(Boolean)

    return orderedDocs
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
      depth: 2,
      draft,
    })

    return result.docs
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
    depth: 2,
    draft,
  })

  return result.docs
}

/**
 * Get all news tags
 */
export async function getAllNewsTags(locale: SupportedLocale = 'uk', draft: boolean = false) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'news-tags',
    locale,
    limit: 100,
    sort: 'name',
    draft,
  })

  return result.docs
}

export async function getSiteData(locale: SupportedLocale = 'uk', draft: boolean = false) {
  const payload = await getPayload({ config })

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
    depth: 2, // Include related pages
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
}
