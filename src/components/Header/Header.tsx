'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useHeader } from '@/contexts/HeaderContext'
import type { NavigationItem, SiteSettings } from './types'

interface HeaderProps {
  locale: string
  siteSettings: SiteSettings
  navigationItems: NavigationItem[]
}

export function Header({ locale, siteSettings, navigationItems }: HeaderProps) {
  const { isMobileNavOpen, toggleMobileNav } = useHeader()
  const pathname = usePathname()

  // Ensure locale is always a string
  const localeString = typeof locale === 'string' ? locale : String(locale || 'uk')

  // Extract path without locale prefix for language switching
  const pathWithoutLocale = pathname.replace(/^\/(uk|en|es)/, '') || '/'

  const homeUrl = `/${localeString}`

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo and Title */}
        <Link
          href={homeUrl}
          className="mr-6 flex items-center space-x-2"
          aria-label={`${siteSettings.siteTitle} - Home`}
        >
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
        <nav className="hidden flex-1 items-center space-x-6 text-sm font-medium md:flex">
          {navigationItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                href={item.href}
                className="text-foreground/60 transition-colors hover:text-foreground/80"
                {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.label}
              </Link>

              {/* Dropdown for children */}
              {item.children && item.children.length > 0 && (
                <div className="absolute left-0 mt-2 hidden w-48 rounded-md border bg-background shadow-lg group-hover:block">
                  <div className="py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-foreground/60 hover:bg-accent hover:text-foreground/80"
                        {...(child.openInNewTab
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
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
          className="mr-2 inline-flex h-9 items-center justify-center rounded-md px-0 py-2 text-base font-medium transition-colors hover:bg-transparent hover:text-accent-foreground focus-visible:bg-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 md:hidden"
          aria-label="Toggle Menu"
          aria-expanded={isMobileNavOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileNavOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Language Switcher */}
        <div className="ml-auto hidden items-center space-x-2 md:flex">
          <Link
            href={`/en${pathWithoutLocale}`}
            className={`rounded px-2 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'en' ? 'bg-accent font-medium' : ''}`}
          >
            EN
          </Link>
          <Link
            href={`/uk${pathWithoutLocale}`}
            className={`rounded px-2 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'uk' ? 'bg-accent font-medium' : ''}`}
          >
            UK
          </Link>
          <Link
            href={`/es${pathWithoutLocale}`}
            className={`rounded px-2 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'es' ? 'bg-accent font-medium' : ''}`}
          >
            ES
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileNavOpen && (
        <div className="border-t md:hidden">
          <nav className="container space-y-2 py-4">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-md px-4 py-2 text-sm hover:bg-accent"
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
                        className="block rounded-md px-4 py-2 text-xs hover:bg-accent"
                        {...(child.openInNewTab
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
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
                href={`/en${pathWithoutLocale}`}
                className={`rounded px-3 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'en' ? 'bg-accent font-medium' : ''}`}
              >
                EN
              </Link>
              <Link
                href={`/uk${pathWithoutLocale}`}
                className={`rounded px-3 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'uk' ? 'bg-accent font-medium' : ''}`}
              >
                UK
              </Link>
              <Link
                href={`/es${pathWithoutLocale}`}
                className={`rounded px-3 py-1 text-sm transition-colors hover:bg-accent ${localeString === 'es' ? 'bg-accent font-medium' : ''}`}
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
