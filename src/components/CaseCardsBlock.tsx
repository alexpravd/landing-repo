'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface CaseSection {
  emoji?: string | null
  label: string
  content: string
  id?: string | null
}

interface CaseCard {
  title: string
  sections: CaseSection[]
  id?: string | null
}

interface ReviewCard {
  quote: string
  authorName: string
  authorSubtitle?: string | null
  id?: string | null
}

export interface CaseCardsBlockProps {
  title?: string | null
  displayMode?: 'cases' | 'reviews' | null
  cases?: CaseCard[] | null
  reviews?: ReviewCard[] | null
  enableAnimation?: boolean | null
}

function renderSectionContent(content: string) {
  const lines = content.split('\n').filter((l) => l.trim())
  const bulletPattern = /^[\u2022\u00b7\-*]\s*/
  const isBulletList = lines.length > 0 && lines.every((l) => bulletPattern.test(l.trim()))

  if (isBulletList) {
    return (
      <ul className="mt-1.5 space-y-1">
        {lines.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-base font-light leading-[120%] -tracking-[0.04em] text-white"
          >
            <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-white" />
            <span>{line.replace(bulletPattern, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="mt-1.5 text-base font-light leading-[120%] -tracking-[0.04em] text-white">
      {content}
    </p>
  )
}

export function CaseCardsBlock({
  title,
  displayMode,
  cases,
  reviews,
  enableAnimation,
}: CaseCardsBlockProps) {
  const isReviews = displayMode === 'reviews'
  const items = isReviews ? (reviews ?? []) : (cases ?? [])
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(2)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = (e: MediaQueryList | MediaQueryListEvent) => setPerPage(e.matches ? 2 : 1)
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))

  // Clamp page when perPage changes
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages - 1))
  }, [totalPages])

  const goNext = useCallback(() => {
    setDirection(1)
    setPage((p) => Math.min(p + 1, totalPages - 1))
  }, [totalPages])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setPage((p) => Math.max(p - 1, 0))
  }, [])

  const start = page * perPage
  const visible = items.slice(start, start + perPage)

  const isFirst = page === 0
  const isLast = page >= totalPages - 1

  const animate = enableAnimation !== false

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto mb-8 sm:mb-10 md:mb-14">
        {/* Header row */}
        <div className="mb-8 flex items-center justify-between sm:mb-10 md:mb-14">
          <h2 className="text-[40px] font-bold uppercase leading-[90%] -tracking-[0.04em] text-white">
            {title || ''}
          </h2>

          {items.length > perPage && (
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  isFirst
                    ? 'cursor-not-allowed border-white/[0.08] text-white/20'
                    : 'border-white/[0.12] text-white/60 hover:border-white/20 hover:text-white'
                }`}
                aria-label="Previous page"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[48px] text-center font-mono text-sm text-white/50">
                {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>

              <button
                onClick={goNext}
                disabled={isLast}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  isLast
                    ? 'cursor-not-allowed border-white/[0.08] text-white/20'
                    : 'border-teal-500/40 text-teal-400 hover:border-teal-400 hover:text-teal-300'
                }`}
                aria-label="Next page"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={animate ? slideVariants : undefined}
              initial={animate ? 'enter' : false}
              animate="center"
              exit={animate ? 'exit' : undefined}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6"
            >
              {visible.map((card, idx) => {
                if (isReviews) {
                  const review = card as ReviewCard
                  return (
                    <div
                      key={review.id || idx}
                      className="flex flex-col justify-between rounded-[10px] border border-[#1C3023] p-6 md:p-8"
                      style={{
                        background:
                          'linear-gradient(180deg, #0D1A12 0%, #08110C 22%, #030B06 60%, #030B06 81%)',
                      }}
                    >
                      <div className="mb-[48px] flex items-start gap-6">
                        <span className="text-5xl leading-none text-[#025A4A]">{'\u201C'}</span>
                        <p className="text-sm leading-relaxed text-white/80">{review.quote}</p>
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                          {review.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{review.authorName}</p>
                          {review.authorSubtitle && (
                            <p className="text-xs text-teal-400">{review.authorSubtitle}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                const caseCard = card as CaseCard
                const cardNumber = String(start + idx + 1).padStart(2, '0')
                return (
                  <div
                    key={caseCard.id || idx}
                    className="rounded-[10px] border border-[#1C3023] p-6 md:p-8"
                    style={{
                      background:
                        'linear-gradient(180deg, #0D1A12 0%, #08110C 22%, #030B06 60%, #030B06 81%)',
                    }}
                  >
                    {/* Card number */}
                    <span className="inline-block text-xl font-medium leading-[120%] -tracking-[0.04em] text-[#025A4A]">
                      {cardNumber}
                    </span>

                    {/* Card title */}
                    <h3 className="mb-6 mt-8 text-[18px] font-medium uppercase leading-[110%] -tracking-[0.04em] text-white">
                      {caseCard.title}
                    </h3>

                    {/* Sections */}
                    <div className="space-y-4">
                      {caseCard.sections.map((section, sIdx) => (
                        <div key={section.id || sIdx}>
                          <div className="flex items-center gap-2">
                            {section.emoji && <span className="text-base">{section.emoji}</span>}
                            <span className="text-base font-light leading-[120%] -tracking-[0.04em] text-white">
                              {section.label}
                            </span>
                          </div>
                          {renderSectionContent(section.content)}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
