'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useHeader } from '@/contexts/HeaderContext'
import type { NavigationItem, SiteSettings } from './types'

interface HeaderProps {
  locale: string
  siteSettings: SiteSettings
  navigationItems: NavigationItem[]
}

export function Header({ locale, siteSettings, navigationItems }: HeaderProps) {
  const { isMobileNavOpen, toggleMobileNav } = useHeader()

  // Ensure locale is always a string
  const localeString = typeof locale === 'string' ? locale : String(locale || 'uk')

  const homeUrl = `/${localeString}`

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo and Title */}
        <Link href={homeUrl} className="mr-6 flex items-center space-x-2" aria-label={`${siteSettings.siteTitle} - Home`}>
          {siteSettings.siteLogo?.url && (
            <Image
              src={siteSettings.siteLogo.url}
              alt={siteSettings.siteLogo.alt || siteSettings.siteTitle}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          )}
          <span className="hidden font-bold sm:inline-block">{siteSettings.siteTitle}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group">
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </Link>

              {/* Dropdown for children */}
              {item.children && item.children.length > 0 && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border hidden group-hover:block">
                  <div className="py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-foreground/60 hover:bg-accent hover:text-foreground/80"
                        {...(child.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileNav}
          className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          aria-label="Toggle Menu"
          aria-expanded={isMobileNavOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileNavOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Language Switcher */}
        <div className="hidden md:flex items-center space-x-2 ml-auto">
          <Link
            href={`/en${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
            className={`px-2 py-1 text-sm rounded ${localeString === 'en' ? 'bg-accent' : ''}`}
          >
            EN
          </Link>
          <Link
            href={`/uk${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
            className={`px-2 py-1 text-sm rounded ${localeString === 'uk' ? 'bg-accent' : ''}`}
          >
            UK
          </Link>
          <Link
            href={`/es${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
            className={`px-2 py-1 text-sm rounded ${localeString === 'es' ? 'bg-accent' : ''}`}
          >
            ES
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md"
                  {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => !item.children?.length && toggleMobileNav()}
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-4 py-2 text-xs hover:bg-accent rounded-md"
                        {...(child.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={toggleMobileNav}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center space-x-2 px-4 py-2">
              <Link
                href={`/en${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
                className={`px-3 py-1 text-sm rounded ${localeString === 'en' ? 'bg-accent' : ''}`}
              >
                EN
              </Link>
              <Link
                href={`/uk${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
                className={`px-3 py-1 text-sm rounded ${localeString === 'uk' ? 'bg-accent' : ''}`}
              >
                UK
              </Link>
              <Link
                href={`/es${typeof window !== 'undefined' ? window.location.pathname.substring(3) : ''}`}
                className={`px-3 py-1 text-sm rounded ${localeString === 'es' ? 'bg-accent' : ''}`}
              >
                ES
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
