'use client'

import { motion } from 'motion/react'
import { getIcon } from '@/lib/icons'
import { getGradientClasses } from '@/lib/gradients'
import type { IconName } from '@/lib/icons'
import type { GradientPreset } from '@/lib/gradients'

export interface SectionHeaderBlockProps {
  type: 'small' | 'big'
  title: string
  subtitle?: string
  description?: string
  badge?: {
    text: string
    icon?: IconName
    gradient?: GradientPreset
  }
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  enableAnimation?: boolean
}

export function SectionHeaderBlock({
  type = 'small',
  title,
  subtitle,
  description,
  badge,
  headingLevel = 'h2',
  enableAnimation = true,
}: SectionHeaderBlockProps) {
  const HeadingTag = headingLevel
  const IconComponent = badge?.icon ? getIcon(badge.icon) : null
  const gradientClasses = badge?.gradient ? getGradientClasses(badge.gradient) : 'from-indigo-500 to-purple-500'

  if (type === 'big') {
    return (
      <motion.div
        initial={enableAnimation ? { y: 20, opacity: 0 } : undefined}
        animate={enableAnimation ? { y: 0, opacity: 1 } : undefined}
        transition={enableAnimation ? { delay: 0.2, duration: 0.5 } : undefined}
        className="text-center mb-8"
      >
        {badge && (
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradientClasses} px-6 py-2 rounded-full mb-6 shadow-lg`}>
            {IconComponent && <IconComponent className="h-4 w-4 text-white" />}
            <span className="text-white">{badge.text}</span>
          </div>
        )}

        <HeadingTag className="text-5xl md:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {title}
        </HeadingTag>

        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            {subtitle}
          </p>
        )}

        {description && (
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>
    )
  }

  // Small type
  return (
    <motion.div
      initial={enableAnimation ? { y: 20, opacity: 0 } : undefined}
      animate={enableAnimation ? { y: 0, opacity: 1 } : undefined}
      transition={enableAnimation ? { duration: 0.5 } : undefined}
      className="text-center mb-12"
    >
      {badge && (
        <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
          {IconComponent && badge.gradient ? (
            <div className={`h-4 w-4 bg-gradient-to-r ${gradientClasses} rounded-full flex items-center justify-center`}>
              <IconComponent className="h-3 w-3 text-white" />
            </div>
          ) : IconComponent ? (
            <IconComponent className="h-4 w-4 text-indigo-700" />
          ) : (
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
          )}
          <span className="text-sm text-indigo-700">
            {badge.text}
          </span>
        </div>
      )}

      <HeadingTag className="text-4xl mb-4 font-bold text-gray-900">
        {title}
      </HeadingTag>

      {subtitle && (
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-2">
          {subtitle}
        </p>
      )}

      {description && (
        <p className="text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </motion.div>
  )
}
