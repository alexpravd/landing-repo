'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import type {
  Page,
  PageBlock,
  PersonPlaceBlock as PersonPlaceBlockType,
  TabBlock as TabBlockType,
  MediaBlock as MediaBlockType,
  AccordionBlock as AccordionBlockType,
} from '@/payload-types'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
import { PersonPlaceBlock } from '@/components/PersonPlaceBlock'
import { TabBlock } from '@/components/TabBlock'
import { MediaBlock } from '@/components/MediaBlock'
import { AccordionBlock } from '@/components/AccordionBlock'
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
