import React from 'react'
import { HeroBlock } from './HeroBlock'
import { FeaturesBlock } from './FeaturesBlock'
import { TestimonialsBlock } from './TestimonialsBlock'
import { StatsBlock } from './StatsBlock'
import { TimelineBlock } from './TimelineBlock'
import { PricingBlock } from './PricingBlock'
import { TeamBlock } from './TeamBlock'
import { FAQBlock } from './FAQBlock'
import { LogoCloudBlock } from './LogoCloudBlock'
import { VideoBlock } from './VideoBlock'
import { CaseStudyBlock } from './CaseStudyBlock'
import { ComparisonBlock } from './ComparisonBlock'
import { SectionHeaderBlock } from './SectionHeaderBlock'
import { MarkdownRichTextBlock } from './MarkdownRichTextBlock'
import { PersonPlaceBlock } from './PersonPlaceBlock'
import { AccordionBlock } from './AccordionBlock'
import { TabBlockServer } from './TabBlockServer'
import { MediaBlock } from './MediaBlock'
import { CallToActionBlock } from './CallToActionBlock'
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
    url?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  secondaryCTA?: {
    label?: string
    url?: string
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

interface FeaturesBlockData {
  blockType: 'featuresBlock'
  title?: string
  subtitle?: string
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'list'
  cardStyle?: 'minimal' | 'bordered' | 'elevated' | 'gradient'
  items: {
    icon?: IconName | string
    title: string
    description?: string
    link?: {
      label?: string
      url?: string
      openInNewTab?: boolean
    }
    id?: string
  }[]
  showCTAs?: boolean
  enableAnimation?: boolean
  id?: string
}

interface TestimonialsBlockData {
  blockType: 'testimonialsBlock'
  title?: string
  subtitle?: string
  displayMode?: 'carousel' | 'grid' | 'single-featured'
  testimonials: {
    quote: string
    authorName: string
    authorRole?: string
    authorCompany?: string
    authorPhoto?: string | Media
    rating?: number
    logo?: string | Media
    id?: string
  }[]
  showRatings?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  enableAnimation?: boolean
  id?: string
}

interface StatsBlockData {
  blockType: 'statsBlock'
  title?: string
  layout?: 'row' | 'grid-2' | 'grid-4'
  stats: {
    value: number
    prefix?: string
    suffix?: string
    label: string
    icon?: IconName | string
    id?: string
  }[]
  animateOnScroll?: boolean
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  enableAnimation?: boolean
  id?: string
}

interface TimelineBlockData {
  blockType: 'timelineBlock'
  title?: string
  subtitle?: string
  layout?: 'vertical' | 'horizontal' | 'alternating'
  items: {
    label: string
    title: string
    description?: string
    icon?: IconName | string
    status?: 'completed' | 'current' | 'upcoming'
    id?: string
  }[]
  showConnectors?: boolean
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  enableAnimation?: boolean
  id?: string
}

interface PricingBlockData {
  blockType: 'pricingBlock'
  title?: string
  subtitle?: string
  layout?: 'cards' | 'table' | 'comparison'
  billingToggle?: boolean
  plans: {
    name: string
    description?: string
    monthlyPrice?: number
    yearlyPrice?: number
    currency?: string
    billingPeriod?: string
    features?: {
      text: string
      included: boolean
      id?: string
    }[]
    cta?: {
      label?: string
      url?: string
      style?: 'solid' | 'outline'
      openInNewTab?: boolean
    }
    highlighted?: boolean
    badge?: string
    id?: string
  }[]
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  enableAnimation?: boolean
  id?: string
}

interface TeamBlockData {
  blockType: 'teamBlock'
  title?: string
  subtitle?: string
  layout?: 'grid' | 'carousel' | 'list'
  columns?: '2' | '3' | '4'
  members: {
    photo: string | Media
    name: string
    role?: string
    bio?: string
    socialLinks?: {
      platform: 'linkedin' | 'twitter' | 'github' | 'email' | 'website'
      url: string
      id?: string
    }[]
    id?: string
  }[]
  showSocialLinks?: boolean
  cardStyle?: 'minimal' | 'card' | 'overlay'
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
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

interface LogoCloudBlockData {
  blockType: 'logoCloudBlock'
  title?: string
  subtitle?: string
  layout?: 'grid' | 'carousel' | 'marquee'
  logos: {
    image: string | Media
    name?: string
    url?: string
    id?: string
  }[]
  grayscale?: boolean
  columns?: '4' | '5' | '6'
  speed?: 'slow' | 'normal' | 'fast'
  enableAnimation?: boolean
  id?: string
}

interface VideoBlockData {
  blockType: 'videoBlock'
  source?: 'youtube' | 'vimeo' | 'custom' | 'upload'
  url?: string
  file?: string | Media
  title?: string
  description?: string
  thumbnail?: string | Media
  autoplay?: boolean
  loop?: boolean
  controls?: boolean
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16'
  enableAnimation?: boolean
  id?: string
}

interface CaseStudyBlockData {
  blockType: 'caseStudyBlock'
  title?: string
  subtitle?: string
  displayMode?: 'cards' | 'detailed' | 'carousel'
  cases: {
    title: string
    clientName?: string
    industry?: string
    challenge?: string
    solution?: string
    results?: {
      metric?: string
      value?: string
      description?: string
      id?: string
    }[]
    testimonial?: {
      quote?: string
      author?: string
    }
    image?: string | Media
    logo?: string | Media
    link?: {
      label?: string
      url?: string
      openInNewTab?: boolean
    }
    id?: string
  }[]
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
  enableAnimation?: boolean
  id?: string
}

interface ComparisonBlockData {
  blockType: 'comparisonBlock'
  title?: string
  subtitle?: string
  type?: 'before-after' | 'table' | 'cards'
  // Before-after fields
  beforeImage?: string | Media
  afterImage?: string | Media
  beforeLabel?: string
  afterLabel?: string
  sliderDefault?: number
  // Table fields
  headers?: {
    text: string
    highlighted?: boolean
    id?: string
  }[]
  rows?: {
    label: string
    values?: {
      text?: string
      isCheckmark?: boolean
      id?: string
    }[]
    id?: string
  }[]
  highlightColumn?: number
  // Cards fields
  items?: {
    title: string
    description?: string
    price?: string
    features?: {
      text: string
      included?: boolean
      id?: string
    }[]
    highlighted?: boolean
    cta?: {
      label?: string
      url?: string
      openInNewTab?: boolean
    }
    id?: string
  }[]
  accentColor?: 'amber' | 'indigo' | 'purple' | 'green' | 'blue'
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
    url?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  secondaryCTA?: {
    label?: string
    url?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  enableAnimation?: boolean
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
  icon?: IconName | string
  link?: {
    label?: string
    url?: string
    openInNewTab?: boolean
  }
  secondaryButton?: {
    label?: string
    url?: string
    style?: 'solid' | 'outline'
    openInNewTab?: boolean
  }
  alignment?: 'centered' | 'left'
  size?: 'compact' | 'standard' | 'large'
  backgroundStyle?: 'gradient' | 'solid' | 'transparent' | 'image'
  backgroundGradient?: GradientPreset | string
  backgroundColor?: string
  backgroundImage?: string | Media
  backgroundOverlay?: boolean
  backgroundOverlayOpacity?: number
  enableAnimation?: boolean
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
  ctaUrl?: string
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
  | HeroBlockData
  | FeaturesBlockData
  | TestimonialsBlockData
  | StatsBlockData
  | TimelineBlockData
  | PricingBlockData
  | TeamBlockData
  | FAQBlockData
  | LogoCloudBlockData
  | VideoBlockData
  | CaseStudyBlockData
  | ComparisonBlockData
  | SectionHeaderBlockData
  | MarkdownRichTextBlockData
  | ImageBlockData
  | CallToActionBlockData
  | PersonPlaceBlockData
  | AccordionBlockData
  | TabBlockData
  | ServiceCardsBlockData
  | AboutBlockData
  | ValueCardsBlockData
  | CaseCardsBlockData
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
                />
              )

            case 'featuresBlock':
              return (
                <FeaturesBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  layout={block.layout}
                  cardStyle={block.cardStyle}
                  items={block.items}
                  showCTAs={block.showCTAs}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'testimonialsBlock':
              return (
                <TestimonialsBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  displayMode={block.displayMode}
                  testimonials={block.testimonials}
                  showRatings={block.showRatings}
                  autoplay={block.autoplay}
                  autoplayInterval={block.autoplayInterval}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'statsBlock':
              return (
                <StatsBlock
                  key={key}
                  title={block.title}
                  layout={block.layout}
                  stats={block.stats}
                  animateOnScroll={block.animateOnScroll}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'timelineBlock':
              return (
                <TimelineBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  layout={block.layout}
                  items={block.items}
                  showConnectors={block.showConnectors}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'pricingBlock':
              return (
                <PricingBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  layout={block.layout}
                  billingToggle={block.billingToggle}
                  plans={block.plans}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'teamBlock':
              return (
                <TeamBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  layout={block.layout}
                  columns={block.columns}
                  members={block.members}
                  showSocialLinks={block.showSocialLinks}
                  cardStyle={block.cardStyle}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
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

            case 'logoCloudBlock':
              return (
                <LogoCloudBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  layout={block.layout}
                  logos={block.logos}
                  grayscale={block.grayscale}
                  columns={block.columns}
                  speed={block.speed}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'videoBlock':
              return (
                <VideoBlock
                  key={key}
                  source={block.source}
                  url={block.url}
                  file={block.file}
                  title={block.title}
                  description={block.description}
                  thumbnail={block.thumbnail}
                  autoplay={block.autoplay}
                  loop={block.loop}
                  controls={block.controls}
                  aspectRatio={block.aspectRatio}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'caseStudyBlock':
              return (
                <CaseStudyBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  displayMode={block.displayMode}
                  cases={block.cases}
                  accentColor={block.accentColor}
                  enableAnimation={block.enableAnimation}
                />
              )

            case 'comparisonBlock':
              return (
                <ComparisonBlock
                  key={key}
                  title={block.title}
                  subtitle={block.subtitle}
                  type={block.type}
                  beforeImage={block.beforeImage}
                  afterImage={block.afterImage}
                  beforeLabel={block.beforeLabel}
                  afterLabel={block.afterLabel}
                  sliderDefault={block.sliderDefault}
                  headers={block.headers}
                  rows={block.rows}
                  highlightColumn={block.highlightColumn}
                  items={block.items}
                  accentColor={block.accentColor}
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
                />
              )

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
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      {block.caption}
                    </p>
                  )}
                </div>
              )

            case 'callToAction':
              return (
                <CallToActionBlock
                  key={key}
                  heading={block.heading}
                  description={block.description}
                  icon={block.icon}
                  link={block.link}
                  secondaryButton={block.secondaryButton}
                  alignment={block.alignment}
                  size={block.size}
                  backgroundStyle={block.backgroundStyle}
                  backgroundGradient={block.backgroundGradient as GradientPreset | undefined}
                  backgroundColor={block.backgroundColor}
                  backgroundImage={block.backgroundImage}
                  backgroundOverlay={block.backgroundOverlay}
                  backgroundOverlayOpacity={block.backgroundOverlayOpacity}
                  enableAnimation={block.enableAnimation}
                />
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
                  ctaUrl={block.ctaUrl}
                  ctaOpenInNewTab={block.ctaOpenInNewTab}
                  enableAnimation={block.enableAnimation}
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
