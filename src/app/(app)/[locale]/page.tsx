import Image from 'next/image'
import { draftMode } from 'next/headers'
import { CarouselBlock } from '@/components/CarouselBlock'
import { SplitContentBlock } from '@/components/SplitContentBlock'
import { EventCardsBlock } from '@/components/EventCardsBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { IframeBlock } from '@/components/IframeBlock'
import { ContactCardsBlock } from '@/components/ContactCardsBlock'
import { CollapsibleTextBlock } from '@/components/CollapsibleTextBlock'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { HeroBlock } from '@/components/HeroBlock'
import { CallToActionBlock } from '@/components/CallToActionBlock'
import { FeaturesBlock } from '@/components/FeaturesBlock'
import { TestimonialsBlock } from '@/components/TestimonialsBlock'
import { StatsBlock } from '@/components/StatsBlock'
import { TimelineBlock } from '@/components/TimelineBlock'
import { PricingBlock } from '@/components/PricingBlock'
import { TeamBlock } from '@/components/TeamBlock'
import { FAQBlock } from '@/components/FAQBlock'
import { LogoCloudBlock } from '@/components/LogoCloudBlock'
import { VideoBlock } from '@/components/VideoBlock'
import { CaseStudyBlock } from '@/components/CaseStudyBlock'
import { ComparisonBlock } from '@/components/ComparisonBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { NewsBlockServer } from '@/components/NewsBlockServer'
import { PersonPlaceBlock } from '@/components/PersonPlaceBlock'
import { TabBlockServer } from '@/components/TabBlockServer'
import { MediaBlock } from '@/components/MediaBlock'
import { AccordionBlock } from '@/components/AccordionBlock'
import { ServiceCardsBlock } from '@/components/ServiceCardsBlock'
import { AboutBlock } from '@/components/AboutBlock'
import { ValueCardsBlock } from '@/components/ValueCardsBlock'
import { CaseCardsBlock } from '@/components/CaseCardsBlock'
import { getHomePage, getSiteData, type SupportedLocale } from '@/lib/payload-data'
import { sanitizeHtml } from '@/lib/sanitize'
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata } from '@/lib/seo'
import type {
  Media,
  PageBlock,
  FeaturesBlock as FeaturesBlockType,
  TestimonialsBlock as TestimonialsBlockType,
  StatsBlock as StatsBlockType,
  TimelineBlock as TimelineBlockType,
  PricingBlock as PricingBlockType,
  TeamBlock as TeamBlockType,
  FAQBlock as FAQBlockType,
  LogoCloudBlock as LogoCloudBlockType,
  VideoBlock as VideoBlockType,
  CaseStudyBlock as CaseStudyBlockType,
  ComparisonBlock as ComparisonBlockType,
  PersonPlaceBlock as PersonPlaceBlockType,
  TabBlock as TabBlockType,
  MediaBlock as MediaBlockType,
  AccordionBlock as AccordionBlockType,
} from '@/payload-types'

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
 * 2. Default hardcoded blocks (as fallback)
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

    // Render blocks (async for server components like TabBlockServer)
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
              />
            )
          case 'featuresBlock':
            return (
              <FeaturesBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                layout={block.layout || 'grid-3'}
                cardStyle={block.cardStyle || 'elevated'}
                items={block.items as FeaturesBlockType['items']}
                showCTAs={block.showCTAs ?? true}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'testimonialsBlock':
            return (
              <TestimonialsBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                displayMode={block.displayMode || 'carousel'}
                testimonials={block.testimonials as TestimonialsBlockType['testimonials']}
                showRatings={block.showRatings ?? true}
                autoplay={block.autoplay ?? true}
                autoplayInterval={block.autoplayInterval ?? undefined}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'statsBlock':
            return (
              <StatsBlock
                key={index}
                title={block.title ?? undefined}
                layout={block.layout || 'grid-4'}
                stats={block.stats as StatsBlockType['stats']}
                animateOnScroll={block.animateOnScroll ?? true}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'timelineBlock':
            return (
              <TimelineBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                layout={block.layout || 'vertical'}
                items={block.items as TimelineBlockType['items']}
                showConnectors={block.showConnectors ?? true}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'pricingBlock':
            return (
              <PricingBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                layout={block.layout || 'cards'}
                billingToggle={block.billingToggle ?? false}
                plans={block.plans as PricingBlockType['plans']}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'teamBlock':
            return (
              <TeamBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                layout={block.layout || 'grid'}
                columns={block.columns ?? undefined}
                members={block.members as TeamBlockType['members']}
                showSocialLinks={block.showSocialLinks ?? true}
                cardStyle={block.cardStyle || 'card'}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
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
          case 'logoCloudBlock':
            return (
              <LogoCloudBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                layout={block.layout || 'grid'}
                logos={block.logos as LogoCloudBlockType['logos']}
                grayscale={block.grayscale ?? true}
                columns={block.columns ?? undefined}
                speed={block.speed ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'videoBlock':
            return (
              <VideoBlock
                key={index}
                source={block.source || 'youtube'}
                url={block.url ?? undefined}
                file={block.file as VideoBlockType['file']}
                title={block.title ?? undefined}
                description={block.description ?? undefined}
                thumbnail={block.thumbnail as VideoBlockType['thumbnail']}
                autoplay={block.autoplay ?? false}
                loop={block.loop ?? false}
                controls={block.controls ?? true}
                aspectRatio={block.aspectRatio ?? '16:9'}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'caseStudyBlock':
            return (
              <CaseStudyBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                displayMode={block.displayMode || 'cards'}
                cases={block.cases as CaseStudyBlockType['cases']}
                accentColor={block.accentColor ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
            )
          case 'comparisonBlock':
            return (
              <ComparisonBlock
                key={index}
                title={block.title ?? undefined}
                subtitle={block.subtitle ?? undefined}
                type={block.type || 'before-after'}
                beforeImage={block.beforeImage as ComparisonBlockType['beforeImage']}
                afterImage={block.afterImage as ComparisonBlockType['afterImage']}
                beforeLabel={block.beforeLabel ?? undefined}
                afterLabel={block.afterLabel ?? undefined}
                sliderDefault={block.sliderDefault ?? undefined}
                headers={block.headers as ComparisonBlockType['headers']}
                rows={block.rows as ComparisonBlockType['rows']}
                highlightColumn={block.highlightColumn ?? undefined}
                items={block.items as ComparisonBlockType['items']}
                accentColor={block.accentColor ?? undefined}
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
              />
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
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
              <CallToActionBlock
                key={index}
                heading={block.heading || ''}
                description={block.description ?? undefined}
                icon={block.icon ?? undefined}
                link={block.link ?? undefined}
                secondaryButton={block.secondaryButton ?? undefined}
                alignment={block.alignment ?? undefined}
                size={block.size ?? undefined}
                backgroundStyle={block.backgroundStyle ?? undefined}
                backgroundGradient={block.backgroundGradient as GradientPreset | undefined}
                backgroundColor={block.backgroundColor ?? undefined}
                backgroundImage={block.backgroundImage as Media | undefined}
                backgroundOverlay={block.backgroundOverlay ?? undefined}
                backgroundOverlayOpacity={block.backgroundOverlayOpacity ?? undefined}
                enableAnimation={block.enableAnimation !== false}
              />
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
                ctaUrl={block.ctaUrl ?? undefined}
                ctaOpenInNewTab={block.ctaOpenInNewTab ?? undefined}
                enableAnimation={block.enableAnimation !== false}
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

  // Fallback: Render default hardcoded blocks if no home page in CMS
  return (
    <div className="min-h-screen bg-background">
      {/* Carousel with images, dates and titles */}
      <CarouselBlock />

      {/* 50/50 block: 1 card left, 4 minimal cards right */}
      <SplitContentBlock />

      {/* Event cards with date/time - 2 rows x 3 cards */}
      <EventCardsBlock />

      {/* Iframe block with map */}
      <IframeBlock />

      {/* Contact cards with photos */}
      <ContactCardsBlock />

      {/* Collapsible grouped text (FAQ) */}
      <CollapsibleTextBlock />
    </div>
  )
}
