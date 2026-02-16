'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import type { Media } from '@/payload-types'

/**
 * Layout options for the logo cloud display
 */
type LayoutType = 'grid' | 'carousel' | 'marquee'

/**
 * Column count options for grid layout
 */
type ColumnCount = '4' | '5' | '6'

/**
 * Animation speed options for carousel and marquee
 */
type SpeedOption = 'slow' | 'normal' | 'fast'

/**
 * Logo item interface
 */
interface LogoItem {
  image: string | Media
  name?: string | null
  url?: string | null
  id?: string | null
}

/**
 * Props interface for the LogoCloudBlock component
 */
export interface LogoCloudBlockProps {
  title?: string | null
  subtitle?: string | null
  layout?: LayoutType | null
  logos?: LogoItem[] | null
  grayscale?: boolean | null
  columns?: ColumnCount | null
  speed?: SpeedOption | null
  enableAnimation?: boolean | null
}

/**
 * Extract image URL from Media object or string
 */
function getImageUrl(image: string | Media | null | undefined): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  return image.url || null
}

/**
 * Get animation duration based on speed setting
 */
function getAnimationDuration(speed: SpeedOption): number {
  switch (speed) {
    case 'slow':
      return 40
    case 'fast':
      return 15
    case 'normal':
    default:
      return 25
  }
}

/**
 * Single Logo Component
 */
function LogoImage({
  logo,
  grayscale,
  enableAnimation,
  index,
}: {
  logo: LogoItem
  grayscale: boolean
  enableAnimation: boolean
  index: number
}) {
  const imageUrl = getImageUrl(logo.image)
  const altText = logo.name || 'Partner logo'

  if (!imageUrl) return null

  const imageElement = (
    <div
      className={`flex items-center justify-center transition-all duration-300 ${
        grayscale
          ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
          : 'opacity-80 hover:opacity-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={altText} className="h-10 w-auto object-contain sm:h-14" />
    </div>
  )

  const itemVariants = enableAnimation
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.05 + index * 0.05, duration: 0.4 },
      }
    : {}

  if (logo.url) {
    return (
      <motion.a
        {...itemVariants}
        href={logo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2"
        aria-label={`Visit ${logo.name || 'partner website'}`}
      >
        {imageElement}
      </motion.a>
    )
  }

  return (
    <motion.div {...itemVariants} className="px-4 py-2">
      {imageElement}
    </motion.div>
  )
}

/**
 * Grid Layout Component
 */
function GridLayout({
  logos,
  columns,
  grayscale,
  enableAnimation,
}: {
  logos: LogoItem[]
  columns: ColumnCount
  grayscale: boolean
  enableAnimation: boolean
}) {
  const getGridClasses = (): string => {
    switch (columns) {
      case '4':
        return 'grid-cols-2 sm:grid-cols-4'
      case '5':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      case '6':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
      default:
        return 'grid-cols-2 sm:grid-cols-4'
    }
  }

  return (
    <div className={`grid gap-6 ${getGridClasses()}`}>
      {logos.map((logo, index) => (
        <LogoImage
          key={logo.id || index}
          logo={logo}
          grayscale={grayscale}
          enableAnimation={enableAnimation}
          index={index}
        />
      ))}
    </div>
  )
}

/**
 * Carousel Layout Component with navigation dots
 */
function CarouselLayout({
  logos,
  grayscale,
  speed,
  enableAnimation,
}: {
  logos: LogoItem[]
  grayscale: boolean
  speed: SpeedOption
  enableAnimation: boolean
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const itemsPerPage = 5
  const totalPages = Math.ceil(logos.length / itemsPerPage)
  const autoplayInterval = getAnimationDuration(speed) * 200 // Convert to ms

  // Auto-advance carousel
  useEffect(() => {
    if (isHovered || totalPages <= 1) return

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [isHovered, totalPages, autoplayInterval])

  const visibleLogos = logos.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-center gap-8">
        {visibleLogos.map((logo, index) => (
          <LogoImage
            key={logo.id || `${currentPage}-${index}`}
            logo={logo}
            grayscale={grayscale}
            enableAnimation={enableAnimation}
            index={index}
          />
        ))}
      </div>

      {/* Navigation dots */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentPage ? 'w-6 bg-indigo-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Marquee Layout Component with infinite scroll
 */
function MarqueeLayout({
  logos,
  grayscale,
  speed,
}: {
  logos: LogoItem[]
  grayscale: boolean
  speed: SpeedOption
}) {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const duration = getAnimationDuration(speed)

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos]

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient masks for smooth fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={marqueeRef}
        className="flex items-center"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedLogos.map((logo, index) => {
          const imageUrl = getImageUrl(logo.image)
          const altText = logo.name || 'Partner logo'

          if (!imageUrl) return null

          const imageElement = (
            <div
              className={`mx-8 flex flex-shrink-0 items-center justify-center transition-all duration-300 ${
                grayscale
                  ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={altText} className="h-10 w-auto object-contain sm:h-14" />
            </div>
          )

          if (logo.url) {
            return (
              <a
                key={`${logo.id || index}-${index >= logos.length ? 'dup' : 'orig'}`}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
                aria-label={`Visit ${logo.name || 'partner website'}`}
              >
                {imageElement}
              </a>
            )
          }

          return (
            <div
              key={`${logo.id || index}-${index >= logos.length ? 'dup' : 'orig'}`}
              className="flex-shrink-0"
            >
              {imageElement}
            </div>
          )
        })}
      </div>

      {/* Marquee keyframes */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * LogoCloudBlock Component
 *
 * A flexible logo showcase component supporting grid, carousel,
 * and marquee display modes with grayscale filter option.
 *
 * @example
 * ```tsx
 * <LogoCloudBlock
 *   title="Trusted by Industry Leaders"
 *   subtitle="Join thousands of companies using our platform"
 *   layout="marquee"
 *   logos={[
 *     { image: '/logo1.png', name: 'Company 1', url: 'https://company1.com' },
 *     { image: '/logo2.png', name: 'Company 2' },
 *   ]}
 *   grayscale={true}
 *   speed="normal"
 * />
 * ```
 */
export function LogoCloudBlock({
  title,
  subtitle,
  layout = 'grid',
  logos,
  grayscale = true,
  columns = '5',
  speed = 'normal',
  enableAnimation = true,
}: LogoCloudBlockProps) {
  const safeLayout = layout || 'grid'
  const safeColumns = columns || '5'
  const safeSpeed = speed || 'normal'
  const safeGrayscale = grayscale ?? true

  // Return null if no logos provided
  if (!logos || logos.length === 0) {
    return null
  }

  // Animation variants for container
  const containerVariants = enableAnimation
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
      }
    : {}

  // Animation variants for header
  const headerVariants = enableAnimation
    ? {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.5 },
      }
    : {}

  return (
    <motion.section {...containerVariants} className="py-12 md:py-16" aria-label="Partner logos">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <motion.div {...headerVariants} className="mb-10 text-center">
            {title && (
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
            )}
            {subtitle && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Logo Display */}
        {safeLayout === 'grid' && (
          <GridLayout
            logos={logos}
            columns={safeColumns}
            grayscale={safeGrayscale}
            enableAnimation={enableAnimation ?? true}
          />
        )}
        {safeLayout === 'carousel' && (
          <CarouselLayout
            logos={logos}
            grayscale={safeGrayscale}
            speed={safeSpeed}
            enableAnimation={enableAnimation ?? true}
          />
        )}
        {safeLayout === 'marquee' && (
          <MarqueeLayout logos={logos} grayscale={safeGrayscale} speed={safeSpeed} />
        )}
      </div>
    </motion.section>
  )
}
