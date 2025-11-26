import type { Metadata } from 'next'

interface SEOFields {
  metaTitle?: string | null
  metaDescription?: string | null
  focusKeyword?: string | null
  keywords?: string | null
  metaImage?: unknown
  canonicalUrl?: string | null
  noIndex?: boolean | null
  noFollow?: boolean | null

  // Open Graph
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: unknown
  ogType?: 'website' | 'article' | 'blog' | string | null

  // Twitter
  twitterCard?: 'summary_large_image' | 'summary' | string | null
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImage?: unknown

  // Alternative field names from Payload CMS
  title?: string | null
  description?: string | null
  image?: unknown

  // Allow any additional fields
  [key: string]: unknown
}

export interface SEOData {
  // Page data - can be string (for direct usage) or localized object from Payload
  title?: string | Record<string, unknown> | null

  // SEO group from Payload (supports both 'seo' and 'meta' field names)
  seo?: SEOFields
  meta?: SEOFields
}

interface GenerateSEOMetadataOptions {
  page: SEOData
  locale?: string
  siteUrl?: string
  siteName?: string
  defaultImage?: string
}

/**
 * Generate comprehensive SEO metadata for Next.js pages
 * Uses all SEO fields from Payload CMS with smart fallbacks
 */
export function generateSEOMetadata({
  page,
  locale = 'uk',
  siteUrl: _siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  siteName = 'Your Site Name',
  defaultImage,
}: GenerateSEOMetadataOptions): Metadata {
  const seo = page.seo || page.meta || {}

  // Helper to extract string from potentially localized field
  const getLocalizedString = (
    value: string | Record<string, unknown> | null | undefined
  ): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (typeof value === 'object' && locale in value) {
      const localized = value[locale]
      return typeof localized === 'string' ? localized : undefined
    }
    return undefined
  }

  // Smart fallbacks for title
  const pageTitle = getLocalizedString(page.title)
  const metaTitle = seo.metaTitle || pageTitle || siteName
  const ogTitle = seo.ogTitle || metaTitle
  const twitterTitle = seo.twitterTitle || ogTitle

  // Smart fallbacks for description (convert null to undefined for Next.js Metadata compatibility)
  const metaDescription = seo.metaDescription ?? undefined
  const ogDescription = seo.ogDescription || metaDescription
  const twitterDescription = seo.twitterDescription || ogDescription

  // Smart fallbacks for images
  const getImageUrl = (image: unknown): string | undefined => {
    if (!image) return undefined
    if (typeof image === 'string') return image
    if (typeof image === 'object' && image !== null && 'url' in image) {
      return (image as { url: string }).url
    }
    return undefined
  }

  const metaImageUrl = getImageUrl(seo.metaImage) || defaultImage
  const ogImageUrl = getImageUrl(seo.ogImage) || metaImageUrl
  const twitterImageUrl = getImageUrl(seo.twitterImage) || ogImageUrl

  // Build robots meta
  const robots: Metadata['robots'] = {
    index: !seo.noIndex,
    follow: !seo.noFollow,
    googleBot: {
      index: !seo.noIndex,
      follow: !seo.noFollow,
    },
  }

  // Build Open Graph metadata
  // Map 'blog' to 'article' as Next.js OpenGraph only supports 'website' | 'article'
  const ogType =
    seo.ogType === 'blog' ? 'article' : seo.ogType === 'article' ? 'article' : 'website'
  const openGraph: Metadata['openGraph'] = {
    title: ogTitle,
    description: ogDescription,
    type: ogType,
    locale: locale,
    siteName: siteName,
    ...(ogImageUrl && {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    }),
  }

  // Build Twitter Card metadata
  const twitterCard = seo.twitterCard === 'summary' ? 'summary' : 'summary_large_image'
  const twitter: Metadata['twitter'] = {
    card: twitterCard,
    title: twitterTitle,
    description: twitterDescription,
    ...(twitterImageUrl && {
      images: [twitterImageUrl],
    }),
  }

  // Build final metadata object
  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    keywords: seo.keywords?.split(',').map((k) => k.trim()),
    robots,
    openGraph,
    twitter,

    // Canonical URL
    ...(seo.canonicalUrl && {
      alternates: {
        canonical: seo.canonicalUrl,
      },
    }),

    // Additional metadata
    authors: [{ name: siteName }],

    // Verification tags (you can add these later)
    // verification: {
    //   google: 'your-google-verification-code',
    //   yandex: 'your-yandex-verification-code',
    // },
  }

  return metadata
}

/**
 * Generate structured data (JSON-LD) for better SEO
 */
export function generateStructuredData({
  page,
  locale = 'uk',
  siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  siteName = 'Your Site Name',
}: {
  page: SEOData & { slug?: string; publishedDate?: string }
  locale?: string
  siteUrl?: string
  siteName?: string
}) {
  const seo = page.seo || page.meta || {}
  const title = seo.metaTitle || seo.title || page.title || siteName
  const description = seo.metaDescription || seo.description
  const imageUrl =
    seo.metaImage && typeof seo.metaImage === 'object' && 'url' in seo.metaImage
      ? seo.metaImage.url
      : undefined

  const url = page.slug ? `${siteUrl}/${locale}/${page.slug}` : `${siteUrl}/${locale}`

  // Base organization schema
  const organization = {
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
  }

  // WebPage schema
  const webPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': seo.ogType === 'article' ? 'Article' : 'WebPage',
    name: title,
    description: description,
    url: url,
    inLanguage: locale,
    publisher: organization,
  }

  if (imageUrl) {
    webPage.image = imageUrl
  }
  if (page.publishedDate) {
    webPage.datePublished = page.publishedDate
  }

  return webPage
}

/**
 * Generate meta tags for robots (noindex, nofollow)
 */
export function generateRobotsMeta(seo?: SEOData['seo']): string {
  if (!seo) return 'index, follow'

  const directives: string[] = []

  if (seo.noIndex) {
    directives.push('noindex')
  } else {
    directives.push('index')
  }

  if (seo.noFollow) {
    directives.push('nofollow')
  } else {
    directives.push('follow')
  }

  return directives.join(', ')
}
