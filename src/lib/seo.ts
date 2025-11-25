import type { Metadata } from 'next'

interface SEOData {
  // Page data - can be string (for direct usage) or localized object from Payload
  title?: string | { [k: string]: any } | null

  // SEO group from Payload
  seo?: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    keywords?: string
    metaImage?: any
    canonicalUrl?: string
    noIndex?: boolean
    noFollow?: boolean

    // Open Graph
    ogTitle?: string
    ogDescription?: string
    ogImage?: any
    ogType?: 'website' | 'article' | 'blog'

    // Twitter
    twitterCard?: 'summary_large_image' | 'summary'
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: any
  }
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
  siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  siteName = 'Your Site Name',
  defaultImage,
}: GenerateSEOMetadataOptions): Metadata {
  const seo = page.seo || {}

  // Helper to extract string from potentially localized field
  const getLocalizedString = (value: string | { [k: string]: any } | null | undefined): string | undefined => {
    if (!value) return undefined
    if (typeof value === 'string') return value
    if (typeof value === 'object' && locale in value) return value[locale]
    return undefined
  }

  // Smart fallbacks for title
  const pageTitle = getLocalizedString(page.title)
  const metaTitle = seo.metaTitle || pageTitle || siteName
  const ogTitle = seo.ogTitle || metaTitle
  const twitterTitle = seo.twitterTitle || ogTitle

  // Smart fallbacks for description
  const metaDescription = seo.metaDescription
  const ogDescription = seo.ogDescription || metaDescription
  const twitterDescription = seo.twitterDescription || ogDescription

  // Smart fallbacks for images
  const getImageUrl = (image: any): string | undefined => {
    if (!image) return undefined
    if (typeof image === 'string') return image
    if (typeof image === 'object' && 'url' in image) return image.url
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
  const openGraph: Metadata['openGraph'] = {
    title: ogTitle,
    description: ogDescription,
    type: seo.ogType || 'website',
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
  const twitter: Metadata['twitter'] = {
    card: seo.twitterCard || 'summary_large_image',
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
    keywords: seo.keywords?.split(',').map(k => k.trim()),
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
  const seo = page.seo || {}
  const title = seo.metaTitle || page.title || siteName
  const description = seo.metaDescription
  const imageUrl = seo.metaImage && typeof seo.metaImage === 'object' && 'url' in seo.metaImage
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
  const webPage = {
    '@context': 'https://schema.org',
    '@type': seo.ogType === 'article' ? 'Article' : 'WebPage',
    name: title,
    description: description,
    url: url,
    ...(imageUrl && { image: imageUrl }),
    ...(page.publishedDate && { datePublished: page.publishedDate }),
    inLanguage: locale,
    publisher: organization,
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
