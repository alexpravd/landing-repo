import Image from 'next/image'
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
import { PersonPlaceBlock } from '@/components/PersonPlaceBlock'
import { TabBlockServer } from '@/components/TabBlockServer'
import { MediaBlock } from '@/components/MediaBlock'
import { AccordionBlock } from '@/components/AccordionBlock'
import { getHomePage, getSiteData, type SupportedLocale } from '@/lib/payload-data'
import { sanitizeHtml } from '@/lib/sanitize'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata } from '@/lib/seo'
import type {
  Media,
  PageBlock,
  PersonPlaceBlock as PersonPlaceBlockType,
  TabBlock as TabBlockType,
  MediaBlock as MediaBlockType,
  AccordionBlock as AccordionBlockType,
} from '@/payload-types'

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

  // Fetch home page and site settings in parallel
  const [homePage, siteData] = await Promise.all([
    getHomePage(localeString as SupportedLocale, false),
    getSiteData(localeString as SupportedLocale, false),
  ])

  const siteName = siteData.siteSettings?.siteTitle || 'Your Site Name'

  // If no home page in CMS, use default metadata
  if (!homePage) {
    return {
      title: `Home - ${siteName}`,
      description: 'Welcome to our website',
    }
  }

  return generateSEOMetadata({
    page: homePage,
    locale: localeString,
    siteName,
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

    // Render blocks (async for server components like TabBlockServer)
    const renderBlock = async (block: PageBlock, index: number): Promise<React.ReactNode> => {
      switch (block.blockType) {
        case 'sectionHeader':
          return (
            <SectionHeaderBlock
              key={index}
              type={block.type || 'small'}
              title={block.title}
              subtitle={block.subtitle ?? undefined}
              description={block.description ?? undefined}
              badge={
                block.badge?.text
                  ? {
                      text: block.badge.text,
                      icon: block.badge.icon as IconName,
                      gradient: block.badge.gradient as GradientPreset,
                    }
                  : undefined
              }
              headingLevel={block.headingLevel || 'h2'}
              enableAnimation={block.enableAnimation !== false}
            />
          )
        case 'richText':
          return (
            <div key={index} className="prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    typeof block.content === 'string'
                      ? block.content
                      : JSON.stringify(block.content)
                  ),
                }}
              />
            </div>
          )
        case 'imageBlock': {
          const image = block.image
          const imageData = typeof image === 'object' ? (image as Media) : null
          return (
            <div key={index} className="my-8">
              {imageData?.url && (
                <figure>
                  <Image
                    src={imageData.url}
                    alt={imageData.alt || block.caption || 'Image'}
                    width={800}
                    height={600}
                    className="w-full rounded-lg"
                    unoptimized
                  />
                  {block.caption && (
                    <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          )
        }
        case 'callToAction':
          return (
            <div
              key={index}
              className="rounded-lg bg-primary p-8 text-center text-primary-foreground"
            >
              {block.heading && <h2 className="mb-4 text-3xl font-bold">{block.heading}</h2>}
              {block.description && <p className="mb-6 text-lg">{block.description}</p>}
              {block.link && (
                <a
                  href={block.link.url}
                  target={block.link.openInNewTab ? '_blank' : undefined}
                  rel={block.link.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="inline-block rounded-md bg-background px-6 py-3 font-semibold text-foreground transition-opacity hover:opacity-90"
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
              accentColor={block.accentColor ?? undefined}
            />
          )
        case 'newsBlock':
          return (
            <NewsBlockServer
              key={index}
              block={{
                displayMode: block.displayMode,
                contentSource: block.contentSource,
                selectedTag: block.selectedTag ?? undefined,
                selectedNews: block.selectedNews ?? undefined,
                limit: block.limit ?? undefined,
                enableSearch: block.enableSearch ?? undefined,
                enableFilters: block.enableFilters ?? undefined,
                enablePagination: block.enablePagination ?? undefined,
                itemsPerPage: block.itemsPerPage ?? undefined,
              }}
              locale={localeString as SupportedLocale}
              draft={isPreview}
            />
          )
        case 'personPlaceBlock':
          return (
            <PersonPlaceBlock
              key={index}
              displayMode={block.displayMode || 'grid'}
              itemsPerRow={block.itemsPerRow ?? undefined}
              items={block.items as PersonPlaceBlockType['items']}
            />
          )
        case 'tabBlock':
          return (
            <TabBlockServer
              key={index}
              tabs={block.tabs as TabBlockType['tabs']}
              locale={localeString as SupportedLocale}
              draft={isPreview}
            />
          )
        case 'mediaBlock':
          return (
            <MediaBlock
              key={index}
              title={block.title ?? undefined}
              displayMode={block.displayMode || 'grid'}
              columns={block.columns ?? undefined}
              media={block.media as MediaBlockType['media']}
              enableLightbox={block.enableLightbox ?? undefined}
            />
          )
        case 'accordionBlock':
          return (
            <AccordionBlock
              key={index}
              title={block.title ?? undefined}
              description={block.description ?? undefined}
              allowMultiple={block.allowMultiple ?? undefined}
              accordionItems={block.accordionItems as AccordionBlockType['accordionItems']}
            />
          )
        default:
          return null
      }
    }

    // Pre-render blocks with Promise.all for async server components
    const renderedBlocks: React.ReactNode[] = await Promise.all(
      homePage.blocks?.map((block, index) => renderBlock(block, index)) ?? []
    )

    // Regular rendering for non-preview mode
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <main>
            {/* Render blocks if available */}
            {renderedBlocks.length > 0 && <div className="space-y-8">{renderedBlocks}</div>}

            {/* Render rich text content if available */}
            {homePage.content && (
              <div className="prose prose-lg max-w-none">
                {/* Basic rich text rendering with sanitization */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(JSON.stringify(homePage.content)),
                  }}
                />
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
