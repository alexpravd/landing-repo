'use client'

import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { Plus, X } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  id?: string | null
}

export interface FAQBlockProps {
  title?: string | null
  questions?: FAQItem[] | null
  allowMultiple?: boolean | null
  enableAnimation?: boolean | null
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

function generateFAQSchema(questions: FAQItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
  return JSON.stringify(schema)
}

export function FAQBlock({
  title,
  questions,
  allowMultiple = false,
  enableAnimation = true,
}: FAQBlockProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  if (!questions || questions.length === 0) return null

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) next.clear()
        next.add(id)
      }
      return next
    })
  }

  const Wrapper = enableAnimation ? motion.div : 'div'
  const Header = enableAnimation ? motion.div : 'div'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateFAQSchema(questions) }}
      />

      <section aria-label="Frequently Asked Questions">
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
            <h2 className="text-[40px] font-bold uppercase leading-[90%] -tracking-[0.04em] text-white">
              {title}
            </h2>
          </Header>
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
        >
          {questions.map((item, index) => {
            const id = item.id || `faq-${index}`
            const isOpen = openItems.has(id)
            const number = String(index + 1).padStart(2, '0')
            const Item = enableAnimation ? motion.div : 'div'

            return (
              <Item
                key={id}
                {...(enableAnimation ? { variants: itemVariants } : {})}
                className="border-t border-white/[0.08]"
              >
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="group flex w-full items-center gap-4 py-6 text-left sm:gap-6 sm:py-8"
                  aria-expanded={isOpen}
                >
                  <span className="flex-shrink-0 font-mono text-sm font-medium tracking-widest text-teal-400/70">
                    {number}
                  </span>

                  <span className="flex-1 text-sm font-semibold uppercase tracking-wide text-white/90 sm:text-base md:text-lg">
                    {item.question}
                  </span>

                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200 sm:h-11 sm:w-11 ${
                      isOpen
                        ? 'border-teal-500/50 bg-teal-500/20'
                        : 'border-teal-500/30 bg-teal-500/[0.06] group-hover:border-teal-400/50 group-hover:bg-teal-500/[0.12]'
                    }`}
                  >
                    {isOpen ? (
                      <X className="h-4 w-4 text-teal-300" />
                    ) : (
                      <Plus className="h-4 w-4 text-teal-300" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-[calc(theme(spacing.4)+2ch+theme(spacing.4))] pr-14 text-sm leading-relaxed text-gray-400 sm:pb-8 sm:pl-[calc(theme(spacing.6)+2ch+theme(spacing.6))] sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Item>
            )
          })}
        </Wrapper>
      </section>
    </>
  )
}
