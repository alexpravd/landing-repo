'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Page } from '@/payload-types'
import { SectionHeaderBlock } from '@/components/SectionHeaderBlock'
import { MarkdownRichTextBlock } from '@/components/MarkdownRichTextBlock'
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
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }, [])

  useEffect(() => {
    if (!isPreview) return

    addDebugInfo('Preview mode initialized')

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
          console.log('🔔 Payload message:', eventData)
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
          console.log('✅ Live preview update applied:', {
            title,
            blocks: updatedData.blocks?.length,
            id: updatedData.id
          })
          setPageData(updatedData as Page)
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
        console.log('📡 Sent ready signals to parent')
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
          <div className="font-bold mb-2">Live Preview Debug</div>
          <div className="text-yellow-400 mb-1">Last update: {pageData.updatedAt || 'N/A'}</div>
          {debugInfo.map((info, i) => (
            <div key={i} className="opacity-70">{info}</div>
          ))}
        </div>
      )}
      <PageContent key={`${pageData.id}-${pageData.updatedAt}`} page={pageData} />
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
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm">
            <strong>🔵 Live Preview Mode</strong> - Changes will appear here automatically
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Render rich text content if available */}
        {content && (
          <div className="prose prose-lg max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: JSON.stringify(content) }} />
          </div>
        )}

        {/* Render blocks if available */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-8">
            {blocks.map((block: any, index: number) => (
              <BlockRenderer key={block.id || index} block={block} />
            ))}
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
          <div dangerouslySetInnerHTML={{ __html: JSON.stringify(block.content) }} />
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
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-dashed border-indigo-300 rounded-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              News Block (Server Component)
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              News Block Preview
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This block will display news articles on the published page
            </p>
            <div className="inline-block bg-white rounded-lg p-4 text-left shadow-sm">
              <div className="text-xs text-gray-500 space-y-1">
                <div><strong>Display Mode:</strong> {block.displayMode || 'list'}</div>
                <div><strong>Content Source:</strong> {block.contentSource || 'all'}</div>
                {block.displayMode === 'list' && (
                  <>
                    <div><strong>Search:</strong> {block.enableSearch ? 'Enabled' : 'Disabled'}</div>
                    <div><strong>Filters:</strong> {block.enableFilters ? 'Enabled' : 'Disabled'}</div>
                    <div><strong>Pagination:</strong> {block.enablePagination ? 'Enabled' : 'Disabled'}</div>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Server components require page refresh to preview. Save and view the published page to see the actual news.
            </p>
          </div>
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
