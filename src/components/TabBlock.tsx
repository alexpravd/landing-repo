'use client'

import { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ImageIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Media } from '@/payload-types'

interface TabImage {
  image: string | Media
  caption?: string | null
  id?: string | null
}

interface TabRecord {
  recordType: 'richText' | 'image' | 'video' | 'imageCard'
  recordRichText?: string | Record<string, unknown> | null
  recordImage?: string | Media | null
  videoUrl?: string | null
  cardImage?: string | Media | null
  cardTitle?: string | null
  cardDescription?: string | null
  cardLink?: string | null
  id?: string | null
}

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | Media | null
  publishedDate?: string | null
  tags?: (string | { id: string; name: string })[] | null
}

interface Tab {
  tabName: string
  contentType: 'richText' | 'news' | 'images' | 'records'
  richTextContent?: string | Record<string, unknown> | null
  newsSource?: 'latest' | 'byTag' | 'manual' | null
  newsTag?: string | { id: string; name: string } | null
  selectedNews?: (string | { id: string; title: string })[] | null
  newsLimit?: number | null
  images?: TabImage[] | null
  records?: TabRecord[] | null
  fetchedNews?: NewsItem[] | null
  id?: string | null
}

export interface TabBlockProps {
  tabs: Tab[]
}

function getMediaUrl(media: string | Media | null | undefined): string | null {
  if (!media) return null
  // If it's a string, check if it's a valid URL (starts with http or /)
  if (typeof media === 'string') {
    if (media.startsWith('http') || media.startsWith('/')) {
      return media
    }
    // It's likely an ID, not a URL
    return null
  }
  return media.url || null
}

function isMediaPending(media: string | Media | null | undefined): boolean {
  if (!media) return false
  // If it's a string that doesn't look like a URL, it's a pending ID
  if (typeof media === 'string') {
    return !media.startsWith('http') && !media.startsWith('/')
  }
  // If it's an object without a URL, it's pending
  if (typeof media === 'object' && !media.url) {
    return true
  }
  return false
}

function getMediaAlt(media: string | Media | null | undefined): string {
  if (!media) return ''
  if (typeof media === 'string') return ''
  return media.alt || ''
}

function VideoEmbed({ url }: { url: string }) {
  const getEmbedUrl = (videoUrl: string): string | null => {
    // YouTube
    const youtubeMatch = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo
    const vimeoMatch = videoUrl.match(/(?:vimeo\.com\/)(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return null
  }

  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Unsupported video URL</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function ImageCard({
  image,
  title,
  description,
  link,
}: {
  image?: string | Media | null
  title?: string | null
  description?: string | null
  link?: string | null
}) {
  const imageUrl = getMediaUrl(image)
  const imageAlt = getMediaAlt(image)
  const isPending = isMediaPending(image)

  const content = (
    <div className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageAlt || title || ''}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : isPending ? (
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">Image loading...</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="p-4">
        {title && <h4 className="mb-2 font-semibold text-foreground">{title}</h4>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )

  if (link) {
    const isExternal = link.startsWith('http')
    return (
      <a
        href={link}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }

  return content
}

function MarkdownContent({ content }: { content?: string | Record<string, unknown> | null }) {
  if (!content) {
    return (
      <div className="rounded-lg bg-muted/50 p-6">
        <p className="text-center text-muted-foreground">No content</p>
      </div>
    )
  }

  // Handle string (markdown) content
  const markdownContent = typeof content === 'string' ? content : ''

  // If it's an object (old Slate data), show a migration notice
  if (typeof content === 'object') {
    return (
      <div className="rounded-lg bg-amber-50 p-6">
        <p className="text-amber-700">
          Content needs to be re-entered using the new Markdown editor.
        </p>
      </div>
    )
  }

  return (
    <div className="prose prose-sm max-w-none text-muted-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-bold text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-bold text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground">{children}</h3>
          ),
          ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ children, href }) => (
            <a href={href} className="text-indigo-600 underline hover:text-indigo-700">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-200 bg-indigo-50/50 py-2 pl-4 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-indigo-700">
                {children}
              </code>
            ) : (
              <code className="block overflow-x-auto rounded-lg bg-slate-900 p-3 text-sm text-slate-100">
                {children}
              </code>
            )
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  )
}

function NewsContent({
  news,
  source,
  limit,
}: {
  news?: NewsItem[] | null
  source?: string | null
  limit?: number | null
}) {
  // If no fetched news, show placeholder (for live preview)
  if (!news || news.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-8">
        <p className="text-center text-muted-foreground">
          News content will be loaded
          {source && ` (${source})`}
          {limit && source !== 'manual' && `, limit: ${limit}`}
        </p>
      </div>
    )
  }

  // Render actual news items
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => {
        const imageUrl = getMediaUrl(item.featuredImage)
        const imageAlt = getMediaAlt(item.featuredImage)
        const isPending = isMediaPending(item.featuredImage)

        return (
          <a
            key={item.id}
            href={`/news/${item.slug}`}
            className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt || item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : isPending ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                {item.title}
              </h4>
              {item.excerpt && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
              )}
              {item.publishedDate && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.publishedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </a>
        )
      })}
    </div>
  )
}

function ImagesContent({ images }: { images?: TabImage[] | null }) {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-6">
        <p className="text-center text-muted-foreground">No images</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((item, index) => {
        const imageUrl = getMediaUrl(item.image)
        const imageAlt = getMediaAlt(item.image)

        // Show placeholder for pending images or when no URL
        if (!imageUrl) {
          return (
            <div key={index} className="group">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-500">Image loading...</p>
                  </div>
                </div>
              </div>
              {item.caption && (
                <p className="mt-2 text-center text-sm text-muted-foreground">{item.caption}</p>
              )}
            </div>
          )
        }

        return (
          <div key={index} className="group">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={imageAlt || item.caption || ''}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {item.caption && (
              <p className="mt-2 text-center text-sm text-muted-foreground">{item.caption}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function RecordsContent({ records }: { records?: TabRecord[] | null }) {
  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-6">
        <p className="text-center text-muted-foreground">No records</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {records.map((record, index) => {
        switch (record.recordType) {
          case 'richText':
            return (
              <div key={index}>
                <MarkdownContent content={record.recordRichText} />
              </div>
            )

          case 'image': {
            const imageUrl = getMediaUrl(record.recordImage)
            const imageAlt = getMediaAlt(record.recordImage)
            const isPending = isMediaPending(record.recordImage)

            // Show placeholder for pending images
            if (!imageUrl && isPending) {
              return (
                <div
                  key={index}
                  className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Image loading...</p>
                    </div>
                  </div>
                </div>
              )
            }

            if (!imageUrl) return null

            return (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
              </div>
            )
          }

          case 'video':
            if (!record.videoUrl) return null
            return (
              <div key={index}>
                <VideoEmbed url={record.videoUrl} />
              </div>
            )

          case 'imageCard':
            return (
              <div key={index}>
                <ImageCard
                  image={record.cardImage}
                  title={record.cardTitle}
                  description={record.cardDescription}
                  link={record.cardLink}
                />
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab.contentType) {
    case 'richText':
      return <MarkdownContent content={tab.richTextContent} />

    case 'news':
      return <NewsContent news={tab.fetchedNews} source={tab.newsSource} limit={tab.newsLimit} />

    case 'images':
      return <ImagesContent images={tab.images} />

    case 'records':
      return <RecordsContent records={tab.records} />

    default:
      return (
        <div className="rounded-lg bg-amber-50 p-6 dark:bg-amber-900/20">
          <p className="text-amber-700 dark:text-amber-400">
            Content type: {tab.contentType || 'unknown'}
          </p>
        </div>
      )
  }
}

export function TabBlock({ tabs }: TabBlockProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.tabName || '')

  if (!tabs || tabs.length === 0) {
    return null
  }

  return (
    <div className="my-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          {tabs.map((tab, index) => (
            <TabsTrigger key={index} value={tab.tabName}>
              {tab.tabName}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab, index) => (
          <TabsContent key={index} value={tab.tabName}>
            <TabContent tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
