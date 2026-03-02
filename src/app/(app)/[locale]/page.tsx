import { draftMode } from 'next/headers'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { HeroBlock } from '@/components/HeroBlock'
import { FAQBlock } from '@/components/FAQBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { ServiceCardsBlock } from '@/components/ServiceCardsBlock'
import { AboutBlock } from '@/components/AboutBlock'
import { ValueCardsBlock } from '@/components/ValueCardsBlock'
import { CaseCardsBlock } from '@/components/CaseCardsBlock'
import { getHomePage, getSiteData, type SupportedLocale } from '@/lib/payload-data'
import { sanitizeHtml } from '@/lib/sanitize'
import { generateSEOMetadata } from '@/lib/seo'
import type { PageBlock, FAQBlock as FAQBlockType } from '@/payload-types'

// Enable ISR with 60-second revalidation
export const revalidate = 60

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
 * Uses Next.js draftMode() API for preview functionality
 *
 * Can render either:
 * 1. Content from Pages collection (if a home page exists)
 * 2. Default empty state (as fallback)
 *
 * Header and Footer are now in the layout.tsx file
 */
export default async function HomePage(props: PageProps) {
  const params = await props.params
  const resolvedSearchParams = await props.searchParams
  const { locale } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Check if draft mode is enabled via Next.js draftMode API or ?preview=true query param
  const draft = await draftMode()
  const isPreview = draft.isEnabled || resolvedSearchParams?.preview === 'true'

  // Try to fetch home page from Pages collection
  const homePage = await getHomePage(localeString as SupportedLocale, isPreview)

  // If home page exists in CMS, render it
  if (homePage) {
    // Use live preview if in preview mode
    if (isPreview) {
      return (
        <div className="min-h-screen bg-background">
          <LivePreviewPage initialData={homePage} locale={localeString} />
        </div>
      )
    }

    // Render blocks (async for server components)
    const renderBlock = async (block: PageBlock, index: number): Promise<React.ReactNode> => {
      const anchorId =
        'anchorId' in block ? (block as { anchorId?: string | null }).anchorId : undefined
      const content = (() => {
        switch (block.blockType) {
          case 'heroBlock':
            return (
              <HeroBlock
                key={index}
                headline={block.headline || ''}
                subheadline={block.subheadline ?? undefined}
                primaryCTA={block.primaryCTA ?? undefined}
                secondaryCTA={block.secondaryCTA ?? undefined}
                enableAnimation={block.enableAnimation !== false}
                isFirstBlock={index === 0}
                locale={localeString}
              />
            )
          case 'faqBlock':
            return (
              <FAQBlock
                key={index}
                title={block.title ?? undefined}
                questions={block.questions as FAQBlockType['questions']}
                allowMultiple={block.allowMultiple ?? false}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'sectionHeader':
            return (
              <SectionHeaderBlock
                key={index}
                layout={block.layout ?? undefined}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                description={block.description ?? undefined}
                primaryCTA={block.primaryCTA ?? undefined}
                secondaryCTA={block.secondaryCTA ?? undefined}
                enableAnimation={block.enableAnimation !== false}
                locale={localeString}
              />
            )
          case 'serviceCardsBlock':
            return (
              <ServiceCardsBlock
                key={index}
                title={block.title ?? undefined}
                cards={block.cards}
                tags={block.tags ?? undefined}
                enableAnimation={block.enableAnimation !== false}
                locale={localeString}
              />
            )
          case 'aboutBlock':
            return (
              <AboutBlock
                key={index}
                title={block.title ?? undefined}
                image={block.image}
                badges={block.badges}
                description={block.description ?? undefined}
                ctaLabel={block.ctaLabel ?? undefined}
                ctaLinkType={block.ctaLinkType ?? undefined}
                ctaPage={block.ctaPage ?? undefined}
                ctaUrl={block.ctaUrl ?? undefined}
                ctaAnchor={block.ctaAnchor ?? undefined}
                ctaOpenInNewTab={block.ctaOpenInNewTab ?? undefined}
                enableAnimation={block.enableAnimation !== false}
                locale={localeString}
              />
            )
          case 'valueCardsBlock':
            return (
              <ValueCardsBlock
                key={index}
                title={block.title ?? undefined}
                description={block.description ?? undefined}
                tags={block.tags ?? undefined}
                cards={block.cards}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'caseCardsBlock':
            return (
              <CaseCardsBlock
                key={index}
                title={block.title ?? undefined}
                displayMode={block.displayMode}
                cases={block.cases}
                reviews={block.reviews}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          default:
            return null
        }
      })()

      return anchorId ? (
        <div key={index} id={anchorId} className="scroll-mt-20">
          {content}
        </div>
      ) : (
        content
      )
    }

    // Pre-render blocks with Promise.all for async server components
    const renderedBlocks: React.ReactNode[] = await Promise.all(
      homePage.blocks?.map((block, index) => renderBlock(block, index)) ?? []
    )

    // Regular rendering for non-preview mode
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
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

  // Fallback: empty state if no home page in CMS
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <p>No home page configured yet.</p>
      </div>
    </div>
  )
}
