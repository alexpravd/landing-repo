import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPageBySlug, getSiteData, type SupportedLocale } from '@/lib/payload-data'
import type {
  Media,
  Page,
  PageBlock,
  PersonPlaceBlock as PersonPlaceBlockType,
  TabBlock as TabBlockType,
  MediaBlock as MediaBlockType,
  AccordionBlock as AccordionBlockType,
} from '@/payload-types'
import { FloatingNav } from '@/components/FloatingNav'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs'
import { Building2 } from 'lucide-react'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { NewsBlockServer } from '@/components/NewsBlockServer'
import { PersonPlaceBlock } from '@/components/PersonPlaceBlock'
import { TabBlockServer } from '@/components/TabBlockServer'
import { MediaBlock } from '@/components/MediaBlock'
import { AccordionBlock } from '@/components/AccordionBlock'
import type { IconName } from '@/lib/icons'
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
 */
export default async function DynamicPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { locale, slug } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Join slug array into a single string (for nested routes like /about/team)
  const pageSlug = slug.join('/')

  // Check if preview mode is enabled
  const isPreview = searchParams.preview === 'true'

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
        <FloatingNav
          backButtonText="Back to Home"
          siteName={(page.title as unknown as string) || ''}
          siteIcon={<Building2 className="h-4 w-4 text-indigo-600" />}
          badgeText={
            page.pageType
              ? page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1)
              : undefined
          }
        />
        <LivePreviewPage initialData={page} />
      </div>
    )
  }

  // Build breadcrumb items from slug segments
  const breadcrumbItems: BreadcrumbItem[] = slug.map((segment, index) => {
    const href = `/${localeString}/${slug.slice(0, index + 1).join('/')}`
    const isLast = index === slug.length - 1
    // Use page title for the last segment, otherwise capitalize the slug segment
    const label = isLast
      ? (page.title as unknown as string) || segment
      : segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
    return { label, href: isLast ? undefined : href }
  })

  // Render based on page type
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav
        backButtonText="Back to Home"
        siteName={(page.title as unknown as string) || ''}
        siteIcon={<Building2 className="h-4 w-4 text-indigo-600" />}
        badgeText={
          page.pageType ? page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1) : undefined
        }
      />
      <PageRenderer
        page={page}
        locale={localeString}
        draft={isPreview}
        breadcrumbItems={breadcrumbItems}
      />
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
  breadcrumbItems,
}: {
  page: Page
  locale: string
  draft: boolean
  breadcrumbItems: BreadcrumbItem[]
}) {
  const { content, blocks, pageType } = page

  // Special handling for 'news' page type
  if (pageType === 'news') {
    // If blocks exist, render them (allows custom configuration)
    if (blocks && blocks.length > 0) {
      return (
        <div className="min-h-screen">
          <div className="container mx-auto px-4 pt-6">
            <Breadcrumbs items={breadcrumbItems} locale={locale} />
          </div>
          <div className="space-y-8">
            {await Promise.all(
              blocks.map(async (block, index) => (
                <BlockRenderer key={index} block={block} locale={locale} draft={draft} />
              ))
            )}
          </div>
        </div>
      )
    }

    // Default: show all news in list mode with search, filters, and pagination
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 pt-6">
          <Breadcrumbs items={breadcrumbItems} locale={locale} />
        </div>
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
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} locale={locale} />

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
                <BlockRenderer key={index} block={block} locale={locale} draft={draft} />
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
}: {
  block: PageBlock
  locale: string
  draft: boolean
}) {
  switch (block.blockType) {
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
          headingLevel={block.headingLevel || 'h2'}
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
        <div className="rounded-lg bg-primary p-8 text-center text-primary-foreground">
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

    default:
      return (
        <div className="rounded border border-dashed border-muted p-4">
          <p className="text-sm text-muted-foreground">
            Unknown block type: {(block as PageBlock).blockType}
          </p>
        </div>
      )
  }
}

/**
 * Generate static params for static site generation
 * This helps Next.js pre-render pages at build time
 */
export async function generateStaticParams() {
  // In production, you might want to fetch all published pages
  // and generate static params for them
  // For now, we'll return an empty array to enable dynamic rendering
  return []
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
