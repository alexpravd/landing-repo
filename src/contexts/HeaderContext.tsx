'use client'

import React, { createContext, useContext, useState } from 'react'

interface HeaderContextType {
  isMobileNavOpen: boolean
  toggleMobileNav: () => void
  closeMobileNav: () => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev)
  }

  const closeMobileNav = () => {
    setIsMobileNavOpen(false)
  }

  return (
    <HeaderContext.Provider
      value={{
        isMobileNavOpen,
        toggleMobileNav,
        closeMobileNav,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider')
  }
  return context
}
