'use client'

import Image from 'next/image'
import { useLivePreview } from '@payloadcms/live-preview-react'
import type {
  Page,
  PageBlock,
  Media,
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
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { HeroBlock } from '@/components/HeroBlock'
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
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { PersonPlaceBlock } from '@/components/PersonPlaceBlock'
import { TabBlock } from '@/components/TabBlock'
import { MediaBlock } from '@/components/MediaBlock'
import { AccordionBlock } from '@/components/AccordionBlock'
import { CallToActionBlock } from '@/components/CallToActionBlock'
import { ServiceCardsBlock } from '@/components/ServiceCardsBlock'
import { AboutBlock } from '@/components/AboutBlock'
import { ValueCardsBlock } from '@/components/ValueCardsBlock'
import { CaseCardsBlock } from '@/components/CaseCardsBlock'
import type { GradientPreset } from '@/lib/gradients'

interface LivePreviewPageProps {
  initialData: Page
  locale?: string
}

export function LivePreviewPage({ initialData, locale }: LivePreviewPageProps) {
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
    depth: 2,
  })

  return <PageContent key={data.id} page={data} locale={locale} />
}

function PageContent({ page, locale }: { page: Page; locale?: string }) {
  const { content, blocks } = page

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Content */}
      <main>
        {/* Render rich text content if available */}
        {content && (
          <div className="prose prose-lg mb-8 max-w-none">
            <div dangerouslySetInnerHTML={{ __html: JSON.stringify(content) }} />
          </div>
        )}

        {/* Render blocks if available */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {blocks.map((block, index) => (
              <BlockRenderer key={block.id || index} block={block} locale={locale} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!content && (!blocks || blocks.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">
            <p>This page has no content yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function BlockRenderer({ block, locale }: { block: PageBlock; locale?: string }) {
  const anchorId =
    'anchorId' in block ? (block as { anchorId?: string | null }).anchorId : undefined
  const content = (() => {
    switch (block.blockType) {
      case 'heroBlock':
        return (
          <HeroBlock
            headline={block.headline || ''}
            subheadline={block.subheadline ?? undefined}
            primaryCTA={block.primaryCTA ?? undefined}
            secondaryCTA={block.secondaryCTA ?? undefined}
            enableAnimation={block.enableAnimation !== false}
          />
        )

      case 'featuresBlock':
        return (
          <FeaturesBlock
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
            title={block.title ?? undefined}
            questions={block.questions as FAQBlockType['questions']}
            allowMultiple={block.allowMultiple ?? false}
            enableAnimation={block.enableAnimation !== false}
          />
        )

      case 'logoCloudBlock':
        return (
          <LogoCloudBlock
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
            layout={block.layout ?? undefined}
            title={block.title ?? undefined}
            subtitle={block.subtitle ?? undefined}
            description={block.description ?? undefined}
            primaryCTA={block.primaryCTA ?? undefined}
            secondaryCTA={block.secondaryCTA ?? undefined}
            enableAnimation={block.enableAnimation !== false}
          />
        )

      case 'richText':
        return (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: JSON.stringify(block.content) }} />
          </div>
        )

      case 'markdownText':
        return (
          <MarkdownRichTextBlock
            markdown={block.markdown || ''}
            accentColor={block.accentColor ?? undefined}
          />
        )

      case 'imageBlock':
        return (
          <div className="my-8">
            {block.image &&
              typeof block.image === 'object' &&
              'url' in block.image &&
              block.image.url && (
                <figure>
                  <Image
                    src={block.image.url}
                    alt={block.image.alt || block.caption || 'Image'}
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

      case 'callToAction':
        return (
          <CallToActionBlock
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

      case 'newsBlock':
        return (
          <div className="rounded-lg border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                News Block (Server Component)
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">News Block Preview</h3>
              <p className="mb-4 text-sm text-gray-600">
                This block will display news articles on the published page
              </p>
              <div className="inline-block rounded-lg bg-white p-4 text-left shadow-sm">
                <div className="space-y-1 text-xs text-gray-500">
                  <div>
                    <strong>Display Mode:</strong> {block.displayMode || 'list'}
                  </div>
                  <div>
                    <strong>Content Source:</strong> {block.contentSource || 'all'}
                  </div>
                  {block.displayMode === 'list' && (
                    <>
                      <div>
                        <strong>Search:</strong> {block.enableSearch ? 'Enabled' : 'Disabled'}
                      </div>
                      <div>
                        <strong>Filters:</strong> {block.enableFilters ? 'Enabled' : 'Disabled'}
                      </div>
                      <div>
                        <strong>Pagination:</strong>{' '}
                        {block.enablePagination ? 'Enabled' : 'Disabled'}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs italic text-gray-500">
                Server components require page refresh to preview. Save and view the published page
                to see the actual news.
              </p>
            </div>
          </div>
        )

      case 'personPlaceBlock':
        return (
          <PersonPlaceBlock
            displayMode={block.displayMode || 'grid'}
            itemsPerRow={block.itemsPerRow ?? undefined}
            items={block.items as PersonPlaceBlockType['items']}
          />
        )

      case 'tabBlock':
        return <TabBlock tabs={block.tabs as TabBlockType['tabs']} />

      case 'mediaBlock':
        return (
          <MediaBlock
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
            title={block.title ?? undefined}
            description={block.description ?? undefined}
            allowMultiple={block.allowMultiple ?? undefined}
            accordionItems={block.accordionItems as AccordionBlockType['accordionItems']}
          />
        )

      case 'serviceCardsBlock':
        return (
          <ServiceCardsBlock
            title={block.title ?? undefined}
            cards={block.cards}
            tags={block.tags ?? undefined}
            enableAnimation={block.enableAnimation ?? true}
            locale={locale}
          />
        )

      case 'aboutBlock':
        return (
          <AboutBlock
            title={block.title ?? undefined}
            image={block.image}
            badges={block.badges}
            description={block.description ?? undefined}
            ctaLabel={block.ctaLabel ?? undefined}
            ctaUrl={block.ctaUrl ?? undefined}
            ctaOpenInNewTab={block.ctaOpenInNewTab ?? undefined}
            enableAnimation={block.enableAnimation ?? true}
          />
        )

      case 'valueCardsBlock':
        return (
          <ValueCardsBlock
            title={block.title ?? undefined}
            description={block.description ?? undefined}
            tags={block.tags ?? undefined}
            cards={block.cards}
            enableAnimation={block.enableAnimation ?? true}
          />
        )

      case 'caseCardsBlock':
        return (
          <CaseCardsBlock
            title={block.title ?? undefined}
            displayMode={block.displayMode}
            cases={block.cases}
            reviews={block.reviews}
            enableAnimation={block.enableAnimation ?? true}
          />
        )

      default: {
        const _exhaustiveCheck: never = block
        return (
          <div className="rounded border border-dashed border-muted p-4">
            <p className="text-sm text-muted-foreground">
              Unknown block type: {(_exhaustiveCheck as PageBlock).blockType}
            </p>
          </div>
        )
      }
    }
  })()

  return anchorId ? (
    <div id={anchorId} className="scroll-mt-20">
      {content}
    </div>
  ) : (
    content
  )
}
