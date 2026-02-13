'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
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
import { HeroBlock, type HeroBlockProps } from '@/components/HeroBlock'
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
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'

interface LivePreviewPageProps {
  initialData: Page
}

export function LivePreviewPage({ initialData }: LivePreviewPageProps) {
  const [pageData, setPageData] = useState<Page>(initialData)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  const addDebugInfo = useCallback((info: string) => {
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }, [])

  useEffect(() => {
    if (!isPreview) return

    addDebugInfo('Preview mode initialized')

    // Listen for messages from Payload admin
    const handleMessage = (event: MessageEvent<unknown>) => {
      // Accept messages from same origin or parent origin
      const validOrigins = [window.location.origin]
      if (!validOrigins.includes(event.origin)) {
        return
      }

      try {
        const eventData = event.data as Record<string, unknown> | null

        // Ignore certain system messages
        if (!eventData || typeof eventData !== 'object') return
        if (eventData.type === 'webpackOk') return
        if (eventData.type === 'webpack') return

        // Track Payload-related messages for debugging panel
        const eventType = eventData.type as string | undefined
        if (eventType?.includes('payload') || eventData.data || eventData.doc) {
          addDebugInfo(`Message: ${eventType || JSON.stringify(eventData).slice(0, 30)}`)
        }

        // Handle different Payload message patterns
        let updatedData: Record<string, unknown> | null = null

        // Check various message patterns
        if (eventData.type === 'payload' && eventData.data) {
          updatedData = eventData.data as Record<string, unknown>
          addDebugInfo('✓ Payload data pattern')
        } else if (eventData.type === 'payload-live-preview' && eventData.data) {
          updatedData = eventData.data as Record<string, unknown>
          addDebugInfo('✓ Live preview pattern')
        } else if (eventData.doc) {
          updatedData = eventData.doc as Record<string, unknown>
          addDebugInfo('✓ Doc pattern')
        } else if (eventData.data && typeof eventData.data === 'object') {
          updatedData = eventData.data as Record<string, unknown>
          addDebugInfo('✓ Data object pattern')
        } else if (eventData.title || eventData.blocks) {
          // Direct document data
          updatedData = eventData
          addDebugInfo('✓ Direct document pattern')
        }

        if (updatedData && (updatedData.title || updatedData.id || updatedData.blocks)) {
          const title = (updatedData.title as string) || 'Untitled'
          addDebugInfo(`✅ Update: ${title.slice(0, 20)}`)
          setPageData(updatedData as unknown as Page)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        addDebugInfo(`❌ Error: ${errorMsg}`)
        console.error('Error handling preview message:', error)
      }
    }

    window.addEventListener('message', handleMessage, false)

    // Send multiple ready signals with different formats
    const sendReadySignals = () => {
      if (window.parent && window.parent !== window) {
        // Signal 1: Standard format
        window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*')
        // Signal 2: With ready flag
        window.parent.postMessage({ type: 'payload-live-preview', ready: true }, '*')
        // Signal 3: Simple ready
        window.parent.postMessage({ ready: true }, '*')

        addDebugInfo('✓ Ready signals sent')
      }
    }

    // Send ready signals multiple times to ensure parent receives them
    sendReadySignals()
    const timeout1 = setTimeout(sendReadySignals, 100)
    const timeout2 = setTimeout(sendReadySignals, 500)
    const timeout3 = setTimeout(sendReadySignals, 1000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, [isPreview, addDebugInfo])

  return (
    <>
      {/* Debug panel - only visible in preview mode */}
      {isPreview && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg bg-black/80 p-3 text-xs text-white">
          <div className="mb-2 font-bold">Live Preview Debug</div>
          <div className="mb-1 text-yellow-400">Last update: {pageData.updatedAt || 'N/A'}</div>
          {debugInfo.map((info, i) => (
            <div key={i} className="opacity-70">
              {info}
            </div>
          ))}
        </div>
      )}
      <PageContent key={pageData.id} page={pageData} />
    </>
  )
}

function PageContent({ page }: { page: Page }) {
  const { content, blocks } = page
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <header className="mb-8">
        {isPreview && (
          <div className="mb-4 border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-700">
            <strong>🔵 Live Preview Mode</strong> - Changes will appear here automatically
          </div>
        )}
      </header>

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
              <BlockRenderer key={block.id || index} block={block} />
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

function BlockRenderer({ block }: { block: PageBlock }) {
  switch (block.blockType) {
    case 'heroBlock':
      return (
        <HeroBlock
          layout={block.layout || 'centered'}
          background={
            block.background
              ? {
                  type: block.background.type ?? undefined,
                  color: block.background.color ?? undefined,
                  gradient: block.background.gradient as GradientPreset | undefined,
                  image: block.background.image as Media | undefined,
                  overlay: block.background.overlay ?? undefined,
                  overlayOpacity: block.background.overlayOpacity ?? undefined,
                }
              : undefined
          }
          badge={
            block.badge?.text
              ? {
                  text: block.badge.text,
                  icon: block.badge.icon as IconName,
                  gradient: block.badge.gradient as GradientPreset,
                }
              : undefined
          }
          headline={block.headline || ''}
          subheadline={block.subheadline ?? undefined}
          bulletPoints={block.bulletPoints as HeroBlockProps['bulletPoints']}
          primaryCTA={block.primaryCTA ?? undefined}
          secondaryCTA={block.secondaryCTA ?? undefined}
          trustBadges={block.trustBadges as HeroBlockProps['trustBadges']}
          heroImage={block.heroImage as Media | undefined}
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
          subtitle={block.subtitle ?? undefined}
          layout={block.layout || 'accordion'}
          questions={block.questions as FAQBlockType['questions']}
          showSearch={block.showSearch ?? true}
          showCategories={block.showCategories ?? true}
          allowMultiple={block.allowMultiple ?? false}
          accentColor={block.accentColor ?? undefined}
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
          headingLevel={block.headingLevel ?? 'h2'}
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
                      <strong>Pagination:</strong> {block.enablePagination ? 'Enabled' : 'Disabled'}
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs italic text-gray-500">
              Server components require page refresh to preview. Save and view the published page to
              see the actual news.
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
}
