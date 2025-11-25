'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type FontSize = 'small' | 'medium' | 'large'

interface AccessibilityContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  bwMode: boolean
  setBwMode: (mode: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

/**
 * Accessibility Provider
 * Manages global accessibility settings (font size, grayscale mode)
 * Following React best practices with context API
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [bwMode, setBwMode] = useState(false)

  const fontSizeClasses = {
    small: 'text-[0.875em]',
    medium: 'text-[1em]',
    large: 'text-[1.125em]',
  }

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        bwMode,
        setBwMode,
      }}
    >
      <div
        className={`${fontSizeClasses[fontSize]} ${bwMode ? 'grayscale' : ''}`}
        style={{
          transition: 'font-size 0.3s ease, filter 0.3s ease',
        }}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

/**
 * Custom hook to use accessibility context
 * @throws {Error} If used outside of AccessibilityProvider
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}
