import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getNewsBySlug, type SupportedLocale } from '@/lib/payload-data'
import type { Media, News, NewsContentBlock, NewsTag, User as PayloadUser } from '@/payload-types'
import { FloatingNav } from '@/components/FloatingNav'
import { Calendar, User, Tag } from 'lucide-react'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { LivePreviewNews } from '@/components/LivePreviewNews'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata, type SEOData } from '@/lib/seo'
import { getTagColorClasses } from '@/lib/tag-colors'

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

// Force dynamic rendering - this page uses searchParams for preview mode
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * News Article Page
 * Displays individual news articles with blocks and metadata
 */
export default async function NewsArticlePage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { locale, slug } = params

  // Ensure locale is always a string
  const localeString = String(locale || 'uk')

  // Check if preview mode is enabled
  const isPreview = searchParams.preview === 'true'

  // Fetch news article by slug
  const article = await getNewsBySlug(slug, localeString as SupportedLocale, isPreview)

  // Show 404 if article not found
  if (!article) {
    notFound()
  }

  // Use live preview component if in preview mode
  if (isPreview) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingNav
          backButtonText="Back to News"
          siteName={(article.title as unknown as string) || ''}
          siteIcon={<Calendar className="h-4 w-4 text-indigo-600" />}
          badgeText="News Article"
        />
        <LivePreviewNews initialData={article} />
      </div>
    )
  }

  // Regular rendering for non-preview mode
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav
        backButtonText="Back to News"
        siteName={(article.title as unknown as string) || ''}
        siteIcon={<Calendar className="h-4 w-4 text-indigo-600" />}
        badgeText="News Article"
      />
      <NewsArticleRenderer article={article} />
    </div>
  )
}

/**
 * News Article Renderer Component
 * Renders article with metadata, featured image, and content blocks
 */
function NewsArticleRenderer({ article }: { article: News }) {
  const { publishedDate, featuredImage, tags, author, blocks } = article
  const title = article.title as unknown as string
  const excerpt = article.excerpt as unknown as string

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Article Header */}
      <header className="mx-auto mb-12 max-w-4xl">
        {/* Tags */}
        {tags && Array.isArray(tags) && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const tagData = typeof tag === 'object' ? (tag as NewsTag) : null
              if (!tagData) return null

              const color = tagData.color || 'indigo'
              const colorClasses = getTagColorClasses(color)

              return (
                <span
                  key={tagData.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${colorClasses.combined}`}
                >
                  <Tag className="h-3 w-3" />
                  {tagData.name}
                </span>
              )
            })}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">{title}</h1>

        {/* Excerpt */}
        {excerpt && <p className="mb-6 text-xl leading-relaxed text-muted-foreground">{excerpt}</p>}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 border-b border-t border-border py-4 text-sm text-muted-foreground">
          {/* Published Date */}
          {publishedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishedDate}>
                {new Date(publishedDate).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          )}

          {/* Author */}
          {author && typeof author === 'object' && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {(author as PayloadUser).name ||
                  (author as PayloadUser).email?.split('@')[0] ||
                  'Anonymous'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage && (
        <div className="mx-auto mb-12 max-w-5xl">
          <figure className="overflow-hidden rounded-xl shadow-lg">
            <Image
              src={(featuredImage as Media).url || ''}
              alt={(featuredImage as Media).alt || title || 'Featured image'}
              width={1200}
              height={675}
              className="aspect-video w-full object-cover"
              priority
            />
            {(featuredImage as Media).caption && (
              <figcaption className="bg-muted px-6 py-3 text-center text-sm text-muted-foreground">
                {(featuredImage as Media).caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* Article Content Blocks */}
      <main className="mx-auto max-w-4xl">
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {blocks.map((block, index) => (
              <BlockRenderer key={block.id || index} block={block} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {(!blocks || blocks.length === 0) && (
          <div className="py-12 text-center text-muted-foreground">
            <p>This article has no content blocks yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Block Renderer
 * Renders different block types for news articles
 */
function BlockRenderer({ block }: { block: NewsContentBlock }) {
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

    default:
      return (
        <div className="rounded border border-dashed border-muted p-4">
          <p className="text-sm text-muted-foreground">
            Unknown block type: {(block as NewsContentBlock).blockType}
          </p>
        </div>
      )
  }
}

/**
 * Rich Text Renderer
 * Renders Slate rich text content
 */
function RichTextRenderer({ content }: { content: RichTextNode[] | Record<string, unknown> }) {
  if (!content) return null

  return (
    <div className="rich-text">
      {Array.isArray(content) ? (
        content.map((node, index) => (
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
 * Generate metadata for SEO
 */
export async function generateMetadata(props: PageProps) {
  const params = await props.params
  const { locale, slug } = params

  const localeString = String(locale || 'uk')
  const article = await getNewsBySlug(slug, localeString as SupportedLocale, false)

  if (!article) {
    return {
      title: 'Article Not Found',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return generateSEOMetadata({
    page: {
      title: article.title as unknown as string,
      seo: article.seo,
    } as SEOData,
    locale: localeString,
    siteName: 'Your Site Name', // TODO: Get from site settings
  })
}
