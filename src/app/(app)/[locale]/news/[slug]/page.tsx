import { notFound } from 'next/navigation'
import { getNewsBySlug, type SupportedLocale } from '@/lib/payload-data'
import type { News } from '@/payload-types'
import { FloatingNav } from '@/components/FloatingNav'
import { Calendar, User, Tag } from 'lucide-react'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { LivePreviewNews } from '@/components/LivePreviewNews'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import { generateSEOMetadata } from '@/lib/seo'

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
      <header className="mb-12 max-w-4xl mx-auto">
        {/* Tags */}
        {tags && Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag: any) => {
              const tagData = typeof tag === 'object' ? tag : null
              if (!tagData) return null

              const color = tagData.color || 'indigo'
              const colorClasses = {
                indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                purple: 'bg-purple-100 text-purple-700 border-purple-200',
                green: 'bg-green-100 text-green-700 border-green-200',
                amber: 'bg-amber-100 text-amber-700 border-amber-200',
                red: 'bg-red-100 text-red-700 border-red-200',
                pink: 'bg-pink-100 text-pink-700 border-pink-200',
                teal: 'bg-teal-100 text-teal-700 border-teal-200',
              }

              return (
                <span
                  key={tagData.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
                >
                  <Tag className="h-3 w-3" />
                  {tagData.name}
                </span>
              )
            })}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-700 py-4">
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
                {author.name || (author as any).email?.split('@')[0] || 'Anonymous'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage && (
        <div className="mb-12 max-w-5xl mx-auto">
          <figure className="rounded-xl overflow-hidden shadow-lg">
            {featuredImage.caption && (
              <figcaption className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                {featuredImage.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* Article Content Blocks */}
      <main className="max-w-4xl mx-auto">
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {blocks.map((block: any, index: number) => (
              <BlockRenderer key={block.id || index} block={block} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {(!blocks || blocks.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
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
function BlockRenderer({ block }: { block: any }) {
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
 * Rich Text Renderer
 * Renders Slate rich text content
 */
function RichTextRenderer({ content }: { content: any }) {
  if (!content) return null

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
    } as any,
    locale: localeString,
    siteName: 'Your Site Name', // TODO: Get from site settings
  })
}
