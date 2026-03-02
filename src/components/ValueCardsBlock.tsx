'use client'

import React from 'react'
import { motion, type Variants } from 'motion/react'
import { GlassTag } from './GlassTag'

interface ValueCard {
  text: string
  id?: string | null
}

interface Tag {
  text: string
  id?: string | null
}

export interface ValueCardsBlockProps {
  title?: string | null
  description?: string | null
  tags?: Tag[] | null
  cards?: ValueCard[] | null
  enableAnimation?: boolean | null
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

export function ValueCardsBlock({
  title,
  description,
  tags,
  cards,
  enableAnimation = true,
}: ValueCardsBlockProps) {
  const hasCards = cards && cards.length > 0
  const hasTags = tags && tags.length > 0
  if (!title && !description && !hasCards && !hasTags) return null

  const Wrapper = enableAnimation ? motion.div : 'div'
  const Card = enableAnimation ? motion.div : 'div'
  const Header = enableAnimation ? motion.div : 'div'

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto mb-8 sm:mb-10 md:mb-14">
        {(title || description || hasTags) && (
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
            {title && (
              <h2 className="text-[40px] font-bold uppercase leading-[90%] -tracking-[0.04em] text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-base font-light leading-[120%] -tracking-[0.04em] text-white">
                {description.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            )}
            {tags && tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <GlassTag
                    key={tag.id ?? i}
                    className="px-3.5 py-1.5 text-sm text-white sm:px-4 sm:py-2"
                  >
                    {tag.text}
                  </GlassTag>
                ))}
              </div>
            )}
          </Header>
        )}

        {hasCards && (
          <Wrapper
            {...(enableAnimation
              ? {
                  variants: containerVariants,
                  initial: 'hidden',
                  whileInView: 'visible',
                  viewport: { once: true, margin: '-80px' },
                }
              : {})}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5"
          >
            {cards!.map((card, index) => (
              <Card
                key={card.id ?? index}
                {...(enableAnimation ? { variants: cardVariants } : {})}
                className="group relative flex items-start rounded-[10px] border border-[#1C3023] p-5 transition-colors duration-300 hover:border-teal-500/25 sm:p-6 md:p-8"
                style={{
                  background:
                    'linear-gradient(180deg, #0D1A12 0%, #08110C 22%, #030B06 60%, #030B06 81%)',
                }}
              >
                {/* Subtle radial glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[10px] bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.06)_0%,_transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <p className="relative text-xl font-medium leading-[32px] tracking-normal text-white">
                  {card.text}
                </p>
              </Card>
            ))}
          </Wrapper>
        )}
      </div>
    </section>
  )
}
