'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { News } from '@/payload-types'
import { Calendar, User, Tag } from 'lucide-react'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'

interface LivePreviewNewsProps {
  initialData: News
}

export function LivePreviewNews({ initialData }: LivePreviewNewsProps) {
  const [articleData, setArticleData] = useState<News>(initialData)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  const addDebugInfo = useCallback((info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }, [])

  useEffect(() => {
    if (!isPreview) return

    addDebugInfo('News preview mode initialized')

    // Listen for messages from Payload admin
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from same origin or parent origin
      const validOrigins = [window.location.origin]
      if (!validOrigins.includes(event.origin)) {
        return
      }

      try {
        const eventData = event.data

        // Ignore certain system messages
        if (!eventData || typeof eventData !== 'object') return
        if (eventData.type === 'webpackOk') return
        if (eventData.type === 'webpack') return

        // Log all Payload-related messages for debugging
        if (eventData.type?.includes('payload') || eventData.data || eventData.doc) {
          console.log('🔔 Payload message (News):', eventData)
          addDebugInfo(`Message: ${eventData?.type || JSON.stringify(eventData).slice(0, 30)}`)
        }

        // Handle different Payload message patterns
        let updatedData = null

        // Check various message patterns
        if (eventData.type === 'payload' && eventData.data) {
          updatedData = eventData.data
          addDebugInfo('✓ Payload data pattern')
        } else if (eventData.type === 'payload-live-preview' && eventData.data) {
          updatedData = eventData.data
          addDebugInfo('✓ Live preview pattern')
        } else if (eventData.doc) {
          updatedData = eventData.doc
          addDebugInfo('✓ Doc pattern')
        } else if (eventData.data && typeof eventData.data === 'object') {
          updatedData = eventData.data
          addDebugInfo('✓ Data object pattern')
        } else if (eventData.title || eventData.blocks) {
          // Direct document data
          updatedData = eventData
          addDebugInfo('✓ Direct document pattern')
        }

        if (updatedData && (updatedData.title || updatedData.id || updatedData.blocks)) {
          const title = updatedData.title || 'Untitled'
          addDebugInfo(`✅ Update: ${title.slice(0, 20)}`)
          console.log('✅ Live preview update applied (News):', {
            title,
            blocks: updatedData.blocks?.length,
            id: updatedData.id
          })
          setArticleData(updatedData as News)
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
        console.log('📡 Sent ready signals to parent (News)')
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
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs z-50">
          <div className="font-bold mb-2">Live Preview Debug (News)</div>
          <div className="text-yellow-400 mb-1">Last update: {articleData.updatedAt || 'N/A'}</div>
          {debugInfo.map((info, i) => (
            <div key={i} className="opacity-70">{info}</div>
          ))}
        </div>
      )}
      <NewsArticleContent key={`${articleData.id}-${articleData.updatedAt}`} article={articleData} />
    </>
  )
}

function NewsArticleContent({ article }: { article: News }) {
  const { title, excerpt, publishedDate, featuredImage, tags, author, blocks } = article
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Preview Banner */}
      {isPreview && (
        <div className="mb-8 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm">
          <strong>🔵 Live Preview Mode</strong> - Changes will appear here automatically
        </div>
      )}

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
          {typeof title === 'string' ? title : (title as any)?.en || (title as any)?.ru || 'Untitled'}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {typeof excerpt === 'string' ? excerpt : (excerpt as any)?.en || (excerpt as any)?.ru || ''}
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
