import React from 'react'
import { SectionHeaderBlock } from './SectionHeaderBlock'
// import { RichTextBlock } from './RichTextBlock' // TODO: Component needs to be updated
import { MarkdownRichTextBlock } from './MarkdownRichTextBlock'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'

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
  content: any
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
  image: any
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

type BlockData =
  | SectionHeaderBlockData
  | RichTextBlockData
  | MarkdownRichTextBlockData
  | ImageBlockData
  | CallToActionBlockData

interface RenderBlocksProps {
  blocks: BlockData[]
  className?: string
}

export function RenderBlocks({ blocks, className = '' }: RenderBlocksProps) {
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
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {/* Add image rendering here */}
                </div>
                {block.caption && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {block.caption}
                  </p>
                )}
              </div>
            )

          case 'callToAction':
            return (
              <div
                key={key}
                className="my-12 p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl text-center"
              >
                <h3 className="text-3xl font-bold mb-4">{block.heading}</h3>
                {block.description && (
                  <p className="text-gray-600 mb-6">{block.description}</p>
                )}
                {block.link && (
                  <a
                    href={block.link.url}
                    target={block.link.openInNewTab ? '_blank' : '_self'}
                    rel={block.link.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {block.link.label}
                  </a>
                )}
              </div>
            )

          default:
            console.warn(`Unknown block type: ${(block as any).blockType}`)
            return null
        }
      })}
    </div>
  )
}
