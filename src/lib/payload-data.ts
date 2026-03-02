import { cache } from 'react'
import { getPayload } from '@/lib/payload'
import type { Page as PayloadPage } from '@/payload-types'

export type SupportedLocale = 'uk'

// Re-export types for external usage
export type Page = PayloadPage

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
  hideHeaderControls?: boolean
}

interface FooterMessengerLink {
  id?: string | null
  platform: 'telegram' | 'viber' | 'whatsapp' | 'signal'
  label: string
  url: string
}

interface FooterData {
  title?: string
  sectionTitle?: string
  sectionSubtitle?: string
  messengerLinks?: FooterMessengerLink[]
  phoneLabel?: string
  phoneNumber?: string
  phoneHref?: string
  emailLabel?: string
  emailAddress?: string
  emailHref?: string
  disclaimer?: string
  formHeading?: string
  formNamePlaceholder?: string
  formPhonePlaceholder?: string
  formEmailPlaceholder?: string
  formOrganizationPlaceholder?: string
  formMessagePlaceholder?: string
  consentText?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  sendAnotherButtonText?: string
  loadingText?: string
  nameRequiredError?: string
  emailRequiredError?: string
  consentRequiredError?: string
  copyrightText?: string
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
  const siteSettings: SiteSettings | undefined = settings
    ? {
        siteTitle: settings.siteTitle || '',
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
        hideHeaderControls: settings.hideHeaderControls || false,
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
  const footer: FooterData | undefined = footerData
    ? {
        title: footerData.title || undefined,
        sectionTitle: footerData.sectionTitle || undefined,
        sectionSubtitle: footerData.sectionSubtitle || undefined,
        messengerLinks: (footerData.messengerLinks as FooterMessengerLink[]) || undefined,
        phoneLabel: footerData.phoneLabel || undefined,
        phoneNumber: footerData.phoneNumber || undefined,
        phoneHref: footerData.phoneHref || undefined,
        emailLabel: footerData.emailLabel || undefined,
        emailAddress: footerData.emailAddress || undefined,
        emailHref: footerData.emailHref || undefined,
        disclaimer: footerData.disclaimer || undefined,
        formHeading: footerData.formHeading || undefined,
        formNamePlaceholder: footerData.formNamePlaceholder || undefined,
        formPhonePlaceholder: footerData.formPhonePlaceholder || undefined,
        formEmailPlaceholder: footerData.formEmailPlaceholder || undefined,
        formOrganizationPlaceholder: footerData.formOrganizationPlaceholder || undefined,
        formMessagePlaceholder: footerData.formMessagePlaceholder || undefined,
        consentText: footerData.consentText || undefined,
        submitButtonText: footerData.submitButtonText || undefined,
        successMessage: footerData.successMessage || undefined,
        errorMessage: footerData.errorMessage || undefined,
        sendAnotherButtonText: footerData.sendAnotherButtonText || undefined,
        loadingText: footerData.loadingText || undefined,
        nameRequiredError: footerData.nameRequiredError || undefined,
        emailRequiredError: footerData.emailRequiredError || undefined,
        consentRequiredError: footerData.consentRequiredError || undefined,
        copyrightText: footerData.copyrightText || undefined,
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
