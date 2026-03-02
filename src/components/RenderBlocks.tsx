import React from 'react'
import { HeroBlock } from './HeroBlock'
import { FAQBlock } from './FAQBlock'
import { SectionHeaderBlock } from './SectionHeaderBlock'
import { ServiceCardsBlock } from './ServiceCardsBlock'
import { AboutBlock } from './AboutBlock'
import { ValueCardsBlock } from './ValueCardsBlock'
import { CaseCardsBlock } from './CaseCardsBlock'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'
import type { Media } from '@/payload-types'
import type { SupportedLocale } from '@/lib/payload-data'

// Type definitions for blocks
interface HeroBlockData {
  blockType: 'heroBlock'
  layout: 'centered' | 'split-left' | 'split-right'
  background?: {
    type?: 'color' | 'gradient' | 'image'
    color?: string
    gradient?: string
    image?: string | Media
    overlay?: boolean
    overlayOpacity?: number
  }
  badge?: {
    text?: string
    icon?: IconName
    gradient?: GradientPreset
  }
  headline: string
  subheadline?: string
  bulletPoints?: Array<{
    icon?: IconName
    text: string
    id?: string
  }>
  primaryCTA?: {
    label?: string
    linkType?: 'page' | 'external' | 'anchor'
    page?: string | { slug?: string }
    url?: string
    anchor?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  secondaryCTA?: {
    label?: string
    linkType?: 'page' | 'external' | 'anchor'
    page?: string | { slug?: string }
    url?: string
    anchor?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  trustBadges?: Array<{
    image: string | Media
    alt?: string
    id?: string
  }>
  heroImage?: string | Media
  enableAnimation?: boolean
  id?: string
}

interface FAQBlockData {
  blockType: 'faqBlock'
  title?: string
  questions: {
    question: string
    answer: string
    id?: string
  }[]
  allowMultiple?: boolean
  enableAnimation?: boolean
  id?: string
}

interface SectionHeaderBlockData {
  blockType: 'sectionHeader'
  layout?: 'centered' | 'left' | 'right'
  title?: string
  subtitle?: string
  description?: string
  primaryCTA?: {
    label?: string
    linkType?: 'page' | 'external' | 'anchor'
    page?: string | { slug?: string }
    url?: string
    anchor?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  secondaryCTA?: {
    label?: string
    linkType?: 'page' | 'external' | 'anchor'
    page?: string | { slug?: string }
    url?: string
    anchor?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  enableAnimation?: boolean
  id?: string
}

interface ServiceCardsBlockData {
  blockType: 'serviceCardsBlock'
  title?: string
  cards: {
    title: string
    bulletPoints?: { text: string; id?: string }[]
    ctaLabel?: string
    ctaLinkType?: 'page' | 'external' | 'anchor'
    ctaPage?: string | { slug?: string }
    ctaUrl?: string
    ctaAnchor?: string
    ctaOpenInNewTab?: boolean
    id?: string
  }[]
  tags?: { text: string; id?: string }[]
  enableAnimation?: boolean
  id?: string
}

interface AboutBlockData {
  blockType: 'aboutBlock'
  title?: string
  image?: string | Media
  badges?: { emoji?: string; text: string; id?: string }[]
  description?: string
  ctaLabel?: string
  ctaLinkType?: 'page' | 'external' | 'anchor'
  ctaPage?: string | { slug?: string }
  ctaUrl?: string
  ctaAnchor?: string
  ctaOpenInNewTab?: boolean
  enableAnimation?: boolean
  id?: string
}

interface ValueCardsBlockData {
  blockType: 'valueCardsBlock'
  title?: string
  description?: string
  tags?: { text: string; id?: string }[]
  cards?: {
    text: string
    id?: string
  }[]
  enableAnimation?: boolean
  id?: string
}

interface CaseCardsBlockData {
  blockType: 'caseCardsBlock'
  title?: string
  displayMode?: 'cases' | 'reviews'
  cases: {
    title: string
    sections: {
      emoji?: string
      label: string
      content: string
      id?: string
    }[]
    id?: string
  }[]
  reviews?: {
    quote: string
    authorName: string
    authorSubtitle?: string
    id?: string
  }[]
  enableAnimation?: boolean
  id?: string
}

type BlockData =
  | HeroBlockData
  | FAQBlockData
  | SectionHeaderBlockData
  | ServiceCardsBlockData
  | AboutBlockData
  | ValueCardsBlockData
  | CaseCardsBlockData

interface RenderBlocksProps {
  blocks: BlockData[]
  className?: string
  locale?: SupportedLocale
}

export async function RenderBlocks({ blocks, className = '', locale = 'uk' }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = block.id || `${block.blockType}-${index}`
        const anchorId = 'anchorId' in block ? (block as { anchorId?: string }).anchorId : undefined

        const rendered = (() => {
          switch (block.blockType) {
            case 'heroBlock':
              return (
                <HeroBlock
                  key={key}
                  headline={block.headline}
                  subheadline={block.subheadline}
                  primaryCTA={block.primaryCTA}
                  secondaryCTA={block.secondaryCTA}
                  enableAnimation={block.enableAnimation}
                  isFirstBlock={index === 0}
                  locale={locale}
                />
              )

            case 'faqBlock':
              return (
                <FAQBlock
                  key={key}
                  title={block.title}
                  questions={block.questions}
                  allowMultiple={block.allowMultiple}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'sectionHeader':
              return (
                <SectionHeaderBlock
                  key={key}
                  layout={block.layout}
                  title={block.title}
                  subtitle={block.subtitle}
                  description={block.description}
                  primaryCTA={block.primaryCTA}
                  secondaryCTA={block.secondaryCTA}
                  enableAnimation={block.enableAnimation}
                  locale={locale}
                />
              )

            case 'serviceCardsBlock':
              return (
                <ServiceCardsBlock
                  key={key}
                  title={block.title}
                  cards={block.cards}
                  tags={block.tags}
                  enableAnimation={block.enableAnimation}
                  locale={locale}
                />
              )

            case 'aboutBlock':
              return (
                <AboutBlock
                  key={key}
                  title={block.title}
                  image={block.image}
                  badges={block.badges}
                  description={block.description}
                  ctaLabel={block.ctaLabel}
                  ctaLinkType={block.ctaLinkType}
                  ctaPage={block.ctaPage}
                  ctaUrl={block.ctaUrl}
                  ctaAnchor={block.ctaAnchor}
                  ctaOpenInNewTab={block.ctaOpenInNewTab}
                  enableAnimation={block.enableAnimation}
                  locale={locale}
                />
              )

            case 'valueCardsBlock':
              return (
                <ValueCardsBlock
                  key={key}
                  title={block.title}
                  description={block.description}
                  tags={block.tags}
                  cards={block.cards}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'caseCardsBlock':
              return (
                <CaseCardsBlock
                  key={key}
                  title={block.title}
                  displayMode={block.displayMode}
                  cases={block.cases}
                  reviews={block.reviews}
                  enableAnimation={block.enableAnimation}
                />
              )

            default:
              console.warn(`Unknown block type: ${(block as BlockData).blockType}`)
              return null
          }
        })()

        return anchorId ? (
          <div key={key} id={anchorId} className="scroll-mt-20">
            {rendered}
          </div>
        ) : (
          rendered
        )
      })}
    </div>
  )
}
