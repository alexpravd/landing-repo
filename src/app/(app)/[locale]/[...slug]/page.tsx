import { notFound } from 'next/navigation'
import Image from 'next/image'
import { draftMode } from 'next/headers'
import {
  getPageBySlug,
  getSiteData,
  getAllPublishedPageSlugs,
  type SupportedLocale,
} from '@/lib/payload-data'
import type {
  Media,
  Page,
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
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
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
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata, type SEOData } from '@/lib/seo'
import { sanitizeHtml } from '@/lib/sanitize'

/**
 * Rich text node interface for Lexical/Slate content
 */
interface RichTextNode {
  type?: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  url?: string
  newTab?: boolean
  children?: RichTextNode[]
}

// Enable ISR with 60-second revalidation for public pages
// Preview mode is handled via searchParams which triggers dynamic rendering automatically
export const revalidate = 60

interface PageProps {
  params: Promise<{
    locale: string
    slug: string[]
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * Dynamic Page Renderer
 * Renders pages based on slug from the Pages collection
 * Supports multiple page types: home, news, leadership, departments, documents, text
 * Uses Next.js draftMode() API for preview functionality
 */
export default async function DynamicPage(props: PageProps) {
  const params = await props.params
  const resolvedSearchParams = await props.searchParams
  const { locale, slug } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Join slug array into a single string (for nested routes like /about/team)
  const pageSlug = slug.join('/')

  // Check if draft mode is enabled via Next.js draftMode API or ?preview=true query param
  const draft = await draftMode()
  const isPreview = draft.isEnabled || resolvedSearchParams?.preview === 'true'

  // Fetch page data by slug
  const page = await getPageBySlug(pageSlug, localeString as SupportedLocale, isPreview)

  // Show 404 if page not found
  if (!page) {
    notFound()
  }

  // Use live preview component if in preview mode
  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <LivePreviewPage initialData={page} locale={localeString} />
      </div>
    )
  }

  // Render based on page type
  return (
    <div className="min-h-screen bg-background">
      <PageRenderer page={page} locale={localeString} draft={isPreview} />
    </div>
  )
}

/**
 * Page Renderer Component
 * Renders different layouts based on page type
 */
async function PageRenderer({
  page,
  locale,
  draft,
}: {
  page: Page
  locale: string
  draft: boolean
}) {
  const { content, blocks, pageType } = page

  // Special handling for 'news' page type
  if (pageType === 'news') {
    // If blocks exist, render them (allows custom configuration)
    if (blocks && blocks.length > 0) {
      return (
        <div className="min-h-screen">
          <div className="space-y-8">
            {await Promise.all(
              blocks.map(async (block, index) => (
                <BlockRenderer
                  key={index}
                  block={block}
                  locale={locale}
                  draft={draft}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      )
    }

    // Default: show all news in list mode with search, filters, and pagination
    return (
      <div className="min-h-screen">
        <NewsBlockServer
          block={{
            displayMode: 'list',
            contentSource: 'all',
            enableSearch: true,
            enableFilters: true,
            enablePagination: true,
            itemsPerPage: 9,
          }}
          locale={locale as SupportedLocale}
          draft={draft}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Main Content */}
      <main>
        {/* Render rich text content if available (for text pages) */}
        {content && (
          <div className="prose prose-lg mb-8 max-w-none">
            <RichTextRenderer content={content} />
          </div>
        )}

        {/* Render blocks if available */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {await Promise.all(
              blocks.map(async (block, index) => (
                <BlockRenderer
                  key={index}
                  block={block}
                  locale={locale}
                  draft={draft}
                  index={index}
                />
              ))
            )}
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

/**
 * Rich Text Renderer
 * Renders Slate rich text content
 */
function RichTextRenderer({ content }: { content: Record<string, unknown> | RichTextNode[] }) {
  if (!content) return null

  // Basic rich text rendering with HTML sanitization for XSS prevention
  return (
    <div className="rich-text">
      {Array.isArray(content) ? (
        content.map((node, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderNode(node)) }} />
        ))
      ) : (
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(JSON.stringify(content)) }} />
      )}
    </div>
  )
}

/**
 * Render a single rich text node
 */
function renderNode(node: RichTextNode): string {
  if (!node) return ''

  if (node.text !== undefined) {
    let text = node.text
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    return text
  }

  const children = node.children?.map(renderNode).join('') || ''

  switch (node.type) {
    case 'h1':
      return `<h1>${children}</h1>`
    case 'h2':
      return `<h2>${children}</h2>`
    case 'h3':
      return `<h3>${children}</h3>`
    case 'h4':
      return `<h4>${children}</h4>`
    case 'h5':
      return `<h5>${children}</h5>`
    case 'h6':
      return `<h6>${children}</h6>`
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'ul':
      return `<ul>${children}</ul>`
    case 'ol':
      return `<ol>${children}</ol>`
    case 'li':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${node.url || '#'}" ${node.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`
    default:
      return `<p>${children}</p>`
  }
}

/**
 * Block Renderer
 * Renders different block types
 */
async function BlockRenderer({
  block,
  locale,
  draft,
  index = 0,
}: {
  block: PageBlock
  locale: string
  draft: boolean
  index?: number
}) {
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
            isFirstBlock={index === 0}
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
            <RichTextRenderer content={block.content as unknown as RichTextNode[]} />
          </div>
        )

      case 'markdownText':
        return (
          <MarkdownRichTextBlock
            markdown={block.markdown || ''}
            accentColor={block.accentColor ?? undefined}
          />
        )

      case 'imageBlock': {
        const image = block.image
        const imageData = typeof image === 'object' ? (image as Media) : null
        return (
          <div className="my-8">
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
          <NewsBlockServer
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
            locale={locale as SupportedLocale}
            draft={draft}
          />
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
        return (
          <TabBlockServer
            tabs={block.tabs as TabBlockType['tabs']}
            locale={locale as SupportedLocale}
            draft={draft}
          />
        )

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
            enableAnimation={block.enableAnimation !== false}
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
            enableAnimation={block.enableAnimation !== false}
          />
        )

      case 'valueCardsBlock':
        return (
          <ValueCardsBlock
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
            title={block.title ?? undefined}
            displayMode={block.displayMode}
            cases={block.cases}
            reviews={block.reviews}
            enableAnimation={block.enableAnimation !== false}
          />
        )

      default:
        return (
          <div className="rounded border border-dashed border-muted p-4">
            <p className="text-sm text-muted-foreground">
              Unknown block type: {(block as PageBlock).blockType}
            </p>
          </div>
        )
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

/**
 * Generate static params for static site generation
 * Pre-builds all published pages at build time for both locales
 */
export async function generateStaticParams() {
  const locales = ['uk'] as const

  try {
    const slugs = await getAllPublishedPageSlugs()

    // Generate params for each slug and locale combination
    const params: Array<{ locale: string; slug: string[] }> = []

    for (const locale of locales) {
      for (const slug of slugs) {
        // Split slug into array for catch-all route
        params.push({
          locale,
          slug: slug.split('/'),
        })
      }
    }

    return params
  } catch (error) {
    console.error('Error generating static params for pages:', error)
    // Return empty array on error to allow dynamic rendering
    return []
  }
}

/**
 * Generate metadata for SEO
 * Uses comprehensive SEO fields from Payload CMS
 */
export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { locale, slug } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')
  const pageSlug = slug.join('/')

  // Fetch page and site settings in parallel
  const [page, siteData] = await Promise.all([
    getPageBySlug(pageSlug, localeString as SupportedLocale, false),
    getSiteData(localeString as SupportedLocale, false),
  ])

  const siteName = siteData.siteSettings?.siteTitle || 'Your Site Name'

  if (!page) {
    return {
      title: 'Page Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return generateSEOMetadata({
    page: page as SEOData,
    locale: localeString,
    siteName,
  })
}
