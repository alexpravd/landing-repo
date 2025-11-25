import { notFound } from 'next/navigation'
import { getPageBySlug, type SupportedLocale } from '@/lib/payload-data'
import type { Page } from '@/payload-types'
import { FloatingNav } from '@/components/FloatingNav'
import { Building2 } from 'lucide-react'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import { NewsBlockServer } from '@/components/NewsBlockServer'
import type { IconName } from '@/lib/icons'
import type { GradientPreset} from '@/lib/gradients'
import { generateSEOMetadata } from '@/lib/seo'

// Force dynamic rendering - this page uses searchParams for preview mode
export const dynamic = 'force-dynamic'

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
          badgeText={page.pageType ? page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1) : undefined}
        />
        <LivePreviewPage initialData={page} />
      </div>
    )
  }

  // Render based on page type
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav
        backButtonText="Back to Home"
        siteName={(page.title as unknown as string) || ''}
        siteIcon={<Building2 className="h-4 w-4 text-indigo-600" />}
        badgeText={page.pageType ? page.pageType.charAt(0).toUpperCase() + page.pageType.slice(1) : undefined}
      />
      <PageRenderer page={page} locale={localeString} draft={isPreview} />
    </div>
  )
}

/**
 * Page Renderer Component
 * Renders different layouts based on page type
 */
async function PageRenderer({ page, locale, draft }: { page: Page; locale: string; draft: boolean }) {
  const { content, blocks, pageType } = page

  // Special handling for 'news' page type
  if (pageType === 'news') {
    // If blocks exist, render them (allows custom configuration)
    if (blocks && blocks.length > 0) {
      return (
        <div className="min-h-screen">
          <div className="space-y-8">
            {await Promise.all(
              blocks.map(async (block: any, index: number) => (
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
          <div className="prose prose-lg max-w-none mb-8">
            <RichTextRenderer content={content} />
          </div>
        )}

        {/* Render blocks if available */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {await Promise.all(
              blocks.map(async (block: any, index: number) => (
                <BlockRenderer key={index} block={block} locale={locale} draft={draft} />
              ))
            )}
          </div>
        )}

        {/* Empty state */}
        {!content && (!blocks || blocks.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
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
function RichTextRenderer({ content }: { content: any }) {
  if (!content) return null

  // Basic rich text rendering - you can enhance this based on your needs
  return (
    <div className="rich-text">
      {Array.isArray(content) ? (
        content.map((node: any, index: number) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: renderNode(node) }} />
        ))
      ) : (
        <div dangerouslySetInnerHTML={{ __html: JSON.stringify(content) }} />
      )}
    </div>
  )
}

/**
 * Render a single rich text node
 */
function renderNode(node: any): string {
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
async function BlockRenderer({ block, locale, draft }: { block: any; locale: string; draft: boolean }) {
  switch (block.blockType) {
    case 'sectionHeader':
      return (
        <SectionHeaderBlock
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
        <div className="prose prose-lg max-w-none">
          <RichTextRenderer content={block.content} />
        </div>
      )

    case 'markdownText':
      return (
        <MarkdownRichTextBlock
          markdown={block.markdown || ''}
          accentColor={block.accentColor}
        />
      )

    case 'imageBlock':
      return (
        <div className="my-8">
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
        <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center">
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

    case 'newsBlock':
      return (
        <NewsBlockServer
          block={block}
          locale={locale as SupportedLocale}
          draft={draft}
        />
      )

    default:
      return (
        <div className="border border-dashed border-muted p-4 rounded">
          <p className="text-sm text-muted-foreground">
            Unknown block type: {block.blockType}
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

  const page = await getPageBySlug(pageSlug, localeString as SupportedLocale, false)

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
    page: page as any,
    locale: localeString,
    siteName: 'Your Site Name', // TODO: Get from site settings
  })
}
