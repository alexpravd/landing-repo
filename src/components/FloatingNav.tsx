'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

export interface FloatingNavProps {
  /**
   * Text for the back button
   * @default "Back to Home"
   */
  backButtonText?: string

  /**
   * Custom back button action. If not provided, navigates back in history
   */
  onBack?: () => void

  /**
   * Show/hide back button
   * @default true
   */
  showBackButton?: boolean

  /**
   * Site/Company name to display
   */
  siteName?: string

  /**
   * Icon to display next to site name
   */
  siteIcon?: ReactNode

  /**
   * Badge text (e.g., "8 Leaders", "12 Articles")
   */
  badgeText?: string

  /**
   * Badge variant
   * @default "default"
   */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'

  /**
   * Additional custom actions to display on the right side
   */
  customActions?: ReactNode

  /**
   * Custom className for the container
   */
  className?: string
}

export function FloatingNav({
  backButtonText = 'Back to Home',
  onBack,
  showBackButton = true,
  siteName,
  siteIcon,
  badgeText,
  badgeVariant = 'default',
  customActions,
  className = '',
}: FloatingNavProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-4 z-40 mx-4 mt-4 md:mx-8 ${className}`}
    >
      <div className="container mx-auto">
        <div className="rounded-3xl border border-white/50 bg-white/90 px-6 py-4 shadow-xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                className="gap-2 rounded-2xl hover:bg-indigo-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backButtonText}</span>
              </Button>
            )}

            {/* Right side - Site info and badges */}
            <div className="ml-auto flex items-center gap-3">
              {/* Site name */}
              {siteName && (
                <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 md:flex">
                  {siteIcon && siteIcon}
                  <span className="text-sm text-indigo-900">{siteName}</span>
                </div>
              )}

              {/* Badge */}
              {badgeText && (
                <Badge
                  variant={badgeVariant}
                  className="border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                >
                  {badgeText}
                </Badge>
              )}

              {/* Custom actions */}
              {customActions}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
