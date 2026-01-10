import React from 'react'
import { SectionHeaderBlock } from './SectionHeaderBlock'
// import { RichTextBlock } from './RichTextBlock' // TODO: Component needs to be updated
import { MarkdownRichTextBlock } from './MarkdownRichTextBlock'
import { PersonPlaceBlock } from './PersonPlaceBlock'
import { AccordionBlock } from './AccordionBlock'
import { TabBlockServer } from './TabBlockServer'
import { MediaBlock } from './MediaBlock'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import type { Media } from '@/payload-types'
import type { SupportedLocale } from '@/lib/payload-data'

// Type definitions for blocks
interface SectionHeaderBlockData {
  blockType: 'sectionHeader'
  type: 'small' | 'big'
  title: string
  subtitle?: string
  description?: string
  badge?: {
    text?: string
    icon?: IconName
    gradient?: GradientPreset
  }
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  enableAnimation?: boolean
  id?: string
}

interface RichTextBlockData {
  blockType: 'richText'
  content: Record<string, unknown> | null
  id?: string
}

interface MarkdownRichTextBlockData {
  blockType: 'markdownText'
  markdown: string
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  id?: string
}

interface ImageBlockData {
  blockType: 'imageBlock'
  image: string | { url?: string | null; alt: string }
  caption?: string
  id?: string
}

interface CallToActionBlockData {
  blockType: 'callToAction'
  heading: string
  description?: string
  link?: {
    label: string
    url: string
    openInNewTab?: boolean
  }
  id?: string
}

interface PersonPlaceBlockData {
  blockType: 'personPlaceBlock'
  displayMode: 'grid' | 'fullRow'
  itemsPerRow?: '3' | '4'
  items: {
    photo: string | { url?: string | null; alt?: string }
    name: string
    subtitle?: string
    description?: string
    customFields?: { label: string; value: string; id?: string }[]
    readMoreLink?: { enabled?: boolean; url?: string; openInNewTab?: boolean }
    id?: string
  }[]
  id?: string
}

interface AccordionBlockLinkItem {
  linkText: string
  linkUrl: string
  openInNewTab?: boolean
  id?: string
}

interface AccordionBlockContentItem {
  contentType: 'text' | 'richText' | 'image' | 'linkList'
  text?: string
  richText?: Record<string, unknown> | null
  image?: string | { url?: string | null; alt?: string; width?: number; height?: number }
  imageCaption?: string
  links?: AccordionBlockLinkItem[]
  id?: string
}

interface AccordionBlockItemData {
  itemTitle: string
  contentItems: AccordionBlockContentItem[]
  id?: string
}

interface AccordionBlockData {
  blockType: 'accordionBlock'
  title?: string
  description?: string
  allowMultiple?: boolean
  accordionItems: AccordionBlockItemData[]
  id?: string
}

interface TabBlockImage {
  image: string | Media
  caption?: string
}

interface TabBlockRecord {
  recordType: 'richText' | 'image' | 'video' | 'imageCard'
  recordRichText?: Record<string, unknown> | null
  recordImage?: string | Media
  videoUrl?: string
  cardImage?: string | Media
  cardTitle?: string
  cardDescription?: string
  cardLink?: string
}

interface TabBlockTab {
  tabName: string
  contentType: 'richText' | 'news' | 'images' | 'records'
  richTextContent?: Record<string, unknown> | null
  newsSource?: 'latest' | 'byTag' | 'manual'
  newsTag?: string | { id: string; name: string }
  selectedNews?: (string | { id: string; title: string })[]
  newsLimit?: number
  images?: TabBlockImage[]
  records?: TabBlockRecord[]
}

interface TabBlockData {
  blockType: 'tabBlock'
  tabs: TabBlockTab[]
  id?: string
}

interface MediaBlockData {
  blockType: 'mediaBlock'
  title?: string | null
  displayMode: 'grid' | 'masonry' | 'carousel'
  columns?: '2' | '3' | '4'
  media: {
    image: string | { url?: string | null; alt?: string | null }
    caption?: string | null
    id?: string
  }[]
  enableLightbox?: boolean
  id?: string
}

type BlockData =
  | SectionHeaderBlockData
  | RichTextBlockData
  | MarkdownRichTextBlockData
  | ImageBlockData
  | CallToActionBlockData
  | PersonPlaceBlockData
  | AccordionBlockData
  | TabBlockData
  | MediaBlockData

interface RenderBlocksProps {
  blocks: BlockData[]
  className?: string
  locale?: SupportedLocale
  draft?: boolean
}

export async function RenderBlocks({
  blocks,
  className = '',
  locale = 'uk',
  draft = false,
}: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = block.id || `${block.blockType}-${index}`

        switch (block.blockType) {
          case 'sectionHeader':
            return (
              <SectionHeaderBlock
                key={key}
                type={block.type}
                title={block.title}
                subtitle={block.subtitle}
                description={block.description}
                badge={block.badge?.text ? { ...block.badge, text: block.badge.text } : undefined}
                headingLevel={block.headingLevel}
                enableAnimation={block.enableAnimation}
              />
            )

          case 'richText':
            // TODO: RichTextBlock needs to be updated to accept content prop
            return null // <RichTextBlock key={key} content={block.content} />

          case 'markdownText':
            return (
              <MarkdownRichTextBlock
                key={key}
                markdown={block.markdown}
                accentColor={block.accentColor}
              />
            )

          case 'imageBlock':
            return (
              <div key={key} className="my-8">
                {/* Image block implementation */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {/* Add image rendering here */}
                </div>
                {block.caption && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">{block.caption}</p>
                )}
              </div>
            )

          case 'callToAction':
            return (
              <div
                key={key}
                className="my-12 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-8 text-center"
              >
                <h3 className="mb-4 text-3xl font-bold">{block.heading}</h3>
                {block.description && (
                  <p className="mb-6 text-muted-foreground">{block.description}</p>
                )}
                {block.link && (
                  <a
                    href={block.link.url}
                    target={block.link.openInNewTab ? '_blank' : '_self'}
                    rel={block.link.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700"
                  >
                    {block.link.label}
                  </a>
                )}
              </div>
            )

          case 'personPlaceBlock':
            return (
              <PersonPlaceBlock
                key={key}
                displayMode={block.displayMode}
                itemsPerRow={block.itemsPerRow}
                items={block.items}
              />
            )

          case 'accordionBlock':
            return (
              <AccordionBlock
                key={key}
                title={block.title}
                description={block.description}
                allowMultiple={block.allowMultiple}
                accordionItems={block.accordionItems}
              />
            )

          case 'tabBlock':
            return <TabBlockServer key={key} tabs={block.tabs} locale={locale} draft={draft} />

          case 'mediaBlock':
            return (
              <MediaBlock
                key={key}
                title={block.title}
                displayMode={block.displayMode}
                columns={block.columns}
                media={block.media}
                enableLightbox={block.enableLightbox}
              />
            )

          default:
            console.warn(`Unknown block type: ${(block as BlockData).blockType}`)
            return null
        }
      })}
    </div>
  )
}
