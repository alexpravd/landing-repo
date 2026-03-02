import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import {
  getPageBySlug,
  getSiteData,
  getAllPublishedPageSlugs,
  type SupportedLocale,
} from '@/lib/payload-data'
import type { Page, PageBlock, FAQBlock as FAQBlockType } from '@/payload-types'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { HeroBlock } from '@/components/HeroBlock'
import { FAQBlock } from '@/components/FAQBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { ServiceCardsBlock } from '@/components/ServiceCardsBlock'
import { AboutBlock } from '@/components/AboutBlock'
import { ValueCardsBlock } from '@/components/ValueCardsBlock'
import { CaseCardsBlock } from '@/components/CaseCardsBlock'
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
      <PageRenderer page={page} locale={localeString} />
    </div>
  )
}

/**
 * Page Renderer Component
 * Renders different layouts based on page type
 */
async function PageRenderer({ page, locale }: { page: Page; locale: string }) {
  const { content, blocks } = page

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
                <BlockRenderer key={index} block={block} locale={locale} index={index} />
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
  index = 0,
}: {
  block: PageBlock
  locale: string
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
            locale={locale}
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
            locale={locale}
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
            ctaLinkType={block.ctaLinkType ?? undefined}
            ctaPage={block.ctaPage ?? undefined}
            ctaUrl={block.ctaUrl ?? undefined}
            ctaAnchor={block.ctaAnchor ?? undefined}
            ctaOpenInNewTab={block.ctaOpenInNewTab ?? undefined}
            enableAnimation={block.enableAnimation !== false}
            locale={locale}
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
