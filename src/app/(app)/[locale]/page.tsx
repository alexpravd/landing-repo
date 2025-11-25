import { CarouselBlock } from '@/components/CarouselBlock'
import { SplitContentBlock } from '@/components/SplitContentBlock'
import { EventCardsBlock } from '@/components/EventCardsBlock'
import { RichTextBlock } from '@/components/RichTextBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { IframeBlock } from '@/components/IframeBlock'
import { ContactCardsBlock } from '@/components/ContactCardsBlock'
import { CollapsibleTextBlock } from '@/components/CollapsibleTextBlock'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { NewsBlockServer } from '@/components/NewsBlockServer'
import { getHomePage, type SupportedLocale } from '@/lib/payload-data'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata } from '@/lib/seo'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Generate metadata for SEO on home page
 * Uses comprehensive SEO fields from Payload CMS
 */
export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { locale } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Try to fetch home page from CMS
  const homePage = await getHomePage(localeString as SupportedLocale, false)

  // If no home page in CMS, use default metadata
  if (!homePage) {
    return {
      title: 'Home - Your Site Name',
      description: 'Welcome to our website',
    }
  }

  return generateSEOMetadata({
    page: homePage,
    locale: localeString,
    siteName: 'Your Site Name', // TODO: Get from site settings
  })
}

/**
 * Home Page - Localized Version
 * Server Component by default - renders on the server for better performance
 * Following Next.js 15 App Router best practices with localization
 *
 * Can render either:
 * 1. Content from Pages collection (if a home page exists)
 * 2. Default hardcoded blocks (as fallback)
 *
 * Header and Footer are now in the layout.tsx file
 */
export default async function HomePage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { locale } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Check if preview mode is enabled
  const isPreview = searchParams.preview === 'true'

  // Try to fetch home page from Pages collection
  const homePage = await getHomePage(localeString as SupportedLocale, isPreview)

  // If home page exists in CMS, render it
  if (homePage) {
    // Use live preview if in preview mode
    if (isPreview) {
      return (
        <div className="min-h-screen bg-background">
          <LivePreviewPage initialData={homePage} />
        </div>
      )
    }

    // Regular rendering for non-preview mode
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <main>
            {/* Render blocks if available */}
            {homePage.blocks && homePage.blocks.length > 0 && (
              <div className="space-y-8">
                {await Promise.all(
                  homePage.blocks.map(async (block: any, index: number) => {
                    switch (block.blockType) {
                      case 'sectionHeader':
                        return (
                          <SectionHeaderBlock
                            key={index}
                            type={block.type || 'small'}
                            title={block.title}
                            subtitle={block.subtitle}
                            description={block.description}
                            badge={block.badge?.text ? {
                              text: block.badge.text,
                              icon: block.badge.icon as IconName,
                              gradient: block.badge.gradient as GradientPreset,
                            } : undefined}
                            headingLevel={block.headingLevel || 'h2'}
                            enableAnimation={block.enableAnimation !== false}
                          />
                        )
                      case 'richText':
                        return (
                          <div key={index} className="prose prose-lg max-w-none">
                            {/* Rich text rendering - basic implementation */}
                            <div dangerouslySetInnerHTML={{ __html: JSON.stringify(block.content) }} />
                          </div>
                        )
                      case 'imageBlock':
                        return (
                          <div key={index} className="my-8">
                            {block.image && typeof block.image === 'object' && 'url' in block.image && (
                              <figure>
                                <img
                                  src={block.image.url}
                                  alt={block.image.alt || block.caption || 'Image'}
                                  className="w-full rounded-lg"
                                />
                                {block.caption && (
                                  <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                                    {block.caption}
                                  </figcaption>
                                )}
                              </figure>
                            )}
                          </div>
                        )
                      case 'callToAction':
                        return (
                          <div key={index} className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
                            {block.heading && <h2 className="text-3xl font-bold mb-4">{block.heading}</h2>}
                            {block.description && <p className="text-lg mb-6">{block.description}</p>}
                            {block.link && (
                              <a
                                href={block.link.url}
                                target={block.link.openInNewTab ? '_blank' : undefined}
                                rel={block.link.openInNewTab ? 'noopener noreferrer' : undefined}
                                className="inline-block bg-background text-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
                              >
                                {block.link.label}
                              </a>
                            )}
                          </div>
                        )
                      case 'markdownText':
                        return (
                          <MarkdownRichTextBlock
                            key={index}
                            markdown={block.markdown || ''}
                            accentColor={block.accentColor}
                          />
                        )
                      case 'newsBlock':
                        return (
                          <NewsBlockServer
                            key={index}
                            block={block}
                            locale={localeString as SupportedLocale}
                            draft={isPreview}
                          />
                        )
                      default:
                        return null
                    }
                  })
                )}
              </div>
            )}

            {/* Render rich text content if available */}
            {homePage.content && (
              <div className="prose prose-lg max-w-none">
                {/* Basic rich text rendering */}
                <div dangerouslySetInnerHTML={{ __html: JSON.stringify(homePage.content) }} />
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  // Fallback: Render default hardcoded blocks if no home page in CMS
  return (
    <div className="min-h-screen bg-background">
      {/* Carousel with images, dates and titles */}
      <CarouselBlock />

      {/* 50/50 block: 1 card left, 4 minimal cards right */}
      <SplitContentBlock />

      {/* Event cards with date/time - 2 rows x 3 cards */}
      <EventCardsBlock />

      {/* Rich text block with markdown-style content */}
      <RichTextBlock />

      {/* Iframe block with map */}
      <IframeBlock />

      {/* Contact cards with photos */}
      <ContactCardsBlock />

      {/* Collapsible grouped text (FAQ) */}
      <CollapsibleTextBlock />
    </div>
  )
}
