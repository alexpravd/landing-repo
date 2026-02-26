'use client'

import { motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GlassTag } from './GlassTag'

interface ServiceCard {
  title: string
  bulletPoints?: { text: string; id?: string | null }[] | null
  ctaLabel?: string | null
  ctaLinkType?: ('page' | 'external' | 'anchor') | null
  ctaPage?: (string | { slug?: string | null }) | null
  ctaUrl?: string | null
  ctaAnchor?: string | null
  ctaOpenInNewTab?: boolean | null
  id?: string | null
}

interface Tag {
  text: string
  id?: string | null
}

export interface ServiceCardsBlockProps {
  title?: string | null
  cards?: ServiceCard[] | null
  tags?: Tag[] | null
  enableAnimation?: boolean | null
  locale?: string
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

function resolveCardHref(card: ServiceCard, locale?: string): string | undefined {
  const linkType = card.ctaLinkType ?? 'external'
  switch (linkType) {
    case 'page': {
      const page = card.ctaPage
      if (typeof page === 'object' && page?.slug) {
        return `/${locale || 'uk'}/${page.slug}`
      }
      return undefined
    }
    case 'external':
      return card.ctaUrl || undefined
    case 'anchor':
      return card.ctaAnchor ? `#${card.ctaAnchor}` : undefined
    default:
      return card.ctaUrl || undefined
  }
}

export function ServiceCardsBlock({
  title,
  cards,
  tags,
  enableAnimation = true,
  locale,
}: ServiceCardsBlockProps) {
  if (!cards || cards.length === 0) return null

  const count = cards.length
  const lastRowStart = count - (count % 3 || 3)
  const lastRowSize = count - lastRowStart

  const getCardWidth = (index: number) => {
    if (count === 1) return 'w-full'
    if (count === 2) return 'w-full sm:w-[calc(50%-10px)] lg:w-[calc(50%-12px)]'
    // 3+ cards: check if this card is in an incomplete last row
    if (lastRowSize < 3 && index >= lastRowStart) {
      if (lastRowSize === 1) return 'w-full sm:w-[calc(50%-10px)]'
      // lastRowSize === 2
      return 'w-full sm:w-[calc(50%-10px)] lg:w-[calc(50%-12px)]'
    }
    return 'w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)]'
  }

  const Wrapper = enableAnimation ? motion.div : 'div'
  const Card = enableAnimation ? motion.div : 'div'
  const Header = enableAnimation ? motion.div : 'div'

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto mb-8 sm:mb-10 md:mb-14">
        {title && (
          <Header
            {...(enableAnimation
              ? {
                  variants: headerVariants,
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: { once: true, margin: '-60px' },
                }
              : {})}
            className="mb-8 sm:mb-10 md:mb-14"
          >
            <h2 className="text-2xl font-bold uppercase tracking-[0.1em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
              {title}
            </h2>
          </Header>
        )}

        {tags && tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
            {tags.map((tag, i) => (
              <GlassTag key={tag.id ?? i} className="px-3 py-1 text-xs text-gray-300 sm:text-sm">
                {tag.text}
              </GlassTag>
            ))}
          </div>
        )}

        <Wrapper
          {...(enableAnimation
            ? {
                variants: containerVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true, margin: '-80px' },
              }
            : {})}
          className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6"
        >
          {cards.map((card, index) => {
            const number = String(index + 1).padStart(2, '0')

            return (
              <Card
                key={card.id ?? index}
                {...(enableAnimation ? { variants: cardVariants } : {})}
                className={`${getCardWidth(index)} group relative flex flex-col rounded-xl border border-white/[0.06] bg-[#0f1613] p-5 transition-colors duration-300 hover:border-teal-500/25 sm:rounded-2xl sm:p-6 md:p-7 lg:p-8`}
              >
                {/* Hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-teal-500/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"
                />

                {/* Number */}
                <span className="relative mb-3 inline-block font-mono text-xs font-medium tracking-widest text-teal-400/70 sm:mb-5">
                  {number}
                </span>

                {/* Title */}
                <h3 className="relative mb-3 text-base font-semibold uppercase tracking-wide text-white/90 sm:mb-5 sm:text-lg">
                  {card.title}
                </h3>

                {/* Bullet points */}
                {card.bulletPoints && card.bulletPoints.length > 0 && (
                  <ul className="relative mb-5 flex-1 space-y-2 sm:mb-8 sm:space-y-3">
                    {card.bulletPoints.map((point, i) => (
                      <li
                        key={point.id ?? i}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-400 sm:gap-3"
                      >
                        <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-teal-500/80" />
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                {card.ctaLabel &&
                  (() => {
                    const href = resolveCardHref(card, locale)
                    if (!href) return null
                    const isAnchor = card.ctaLinkType === 'anchor'
                    const openInNewTab = !isAnchor && card.ctaOpenInNewTab
                    return (
                      <div className="relative mt-auto pt-1 sm:pt-2">
                        <Link
                          href={href}
                          target={openInNewTab ? '_blank' : undefined}
                          rel={openInNewTab ? 'noopener noreferrer' : undefined}
                          className="group/btn inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/[0.06] px-4 py-1.5 text-sm font-medium text-teal-300 transition-all duration-300 hover:border-teal-400/50 hover:bg-teal-500/[0.12] hover:shadow-[0_0_24px_-4px_rgba(20,184,166,0.25)] active:scale-[0.97] sm:px-5 sm:py-2"
                        >
                          {card.ctaLabel}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    )
                  })()}
              </Card>
            )
          })}
        </Wrapper>
      </div>
    </section>
  )
}
