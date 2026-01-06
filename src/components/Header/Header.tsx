'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  ChevronDown,
  Home,
  Newspaper,
  Users,
  BookOpen,
  MessageCircle,
  Folder,
  FileText,
  Code,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Cpu,
  Github,
  Twitter,
  X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NavigationItem, SiteSettings } from './types'

interface HeaderProps {
  locale: string
  siteSettings: SiteSettings
  navigationItems: NavigationItem[]
}

// Language options with flags
const languages = [
  { code: 'uk', label: 'UK', fullName: 'Українська', flag: '🇺🇦' },
  { code: 'en', label: 'EN', fullName: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'ES', fullName: 'Español', flag: '🇪🇸' },
]

// Icon mapping for navigation items
const getNavIcon = (label: string): typeof Home | null => {
  const normalizedLabel = label.toLowerCase()
  if (normalizedLabel.includes('голов') || normalizedLabel.includes('home')) return Home
  if (normalizedLabel.includes('новин') || normalizedLabel.includes('news')) return Newspaper
  if (normalizedLabel.includes('про нас') || normalizedLabel.includes('about')) return Users
  if (normalizedLabel.includes('ресурс') || normalizedLabel.includes('resource')) return BookOpen
  if (normalizedLabel.includes('спільнот') || normalizedLabel.includes('communit'))
    return MessageCircle
  if (normalizedLabel.includes('категор') || normalizedLabel.includes('categor')) return Folder
  if (normalizedLabel.includes('документ') || normalizedLabel.includes('doc')) return FileText
  if (normalizedLabel.includes('api')) return Code
  if (normalizedLabel.includes('інновац') || normalizedLabel.includes('innov')) return Lightbulb
  if (normalizedLabel.includes('бізнес') || normalizedLabel.includes('business')) return Briefcase
  if (normalizedLabel.includes('освіт') || normalizedLabel.includes('educat')) return GraduationCap
  if (normalizedLabel.includes('технолог') || normalizedLabel.includes('tech')) return Cpu
  if (normalizedLabel.includes('github')) return Github
  if (normalizedLabel.includes('twitter') || normalizedLabel.includes('x')) return Twitter
  if (normalizedLabel.includes('discord')) return MessageCircle
  return null
}

export function Header({ locale, siteSettings, navigationItems }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Ensure locale is always a string
  const localeString = typeof locale === 'string' ? locale : String(locale || 'uk')

  // Extract path without locale prefix for language switching
  const pathWithoutLocale = pathname.replace(/^\/(uk|en|es)/, '') || '/'

  const homeUrl = `/${localeString}`

  // Animation mount state
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
    } else {
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen])

  // Toggle expanded state for mobile menu items with children
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  // Close mobile menu and navigate
  const handleMobileNavClick = () => {
    setIsOpen(false)
    setExpandedItems([])
  }

  // Check if a path is active
  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo and Title */}
        <Link
          href={homeUrl}
          className="mr-6 flex min-h-[44px] items-center space-x-2"
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

        {/* Desktop Language Switcher */}
        <div className="ml-auto hidden items-center space-x-1 md:flex">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}${pathWithoutLocale}`}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                localeString === lang.code && 'bg-accent'
              )}
            >
              {lang.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu - Redesigned Sheet */}
        <div className="ml-auto md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-12 w-12 rounded-xl transition-all duration-200 hover:bg-primary/10 active:scale-95"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                'flex w-full max-w-[340px] flex-col overflow-hidden border-l-0 p-0 sm:max-w-[380px]',
                // Deep editorial gradient background
                'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950'
              )}
            >
              {/* Custom close button - larger and more prominent */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white active:scale-95"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Decorative gradient orb */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 top-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              {/* Header with logo and branding */}
              <div className="relative border-b border-white/10 px-6 pb-6 pt-6">
                <div
                  className={cn(
                    'flex items-center gap-4 transition-all duration-500',
                    mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                  )}
                >
                  {siteSettings.siteLogo?.url ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg" />
                      <Image
                        src={siteSettings.siteLogo.url}
                        alt={siteSettings.siteLogo.alt || siteSettings.siteTitle}
                        width={48}
                        height={48}
                        className="relative h-12 w-12 rounded-xl object-contain"
                      />
                    </div>
                  ) : (
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
                      <span className="text-xl font-bold text-white">
                        {siteSettings.siteTitle.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {siteSettings.siteTitle}
                    </h2>
                    {siteSettings.tagline && (
                      <p className="text-sm text-white/50">{siteSettings.tagline}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Items with staggered animation */}
              <nav className="scrollbar-hide relative flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                  {navigationItems.map((item, index) => {
                    const IconComponent = getNavIcon(item.label)
                    const hasChildren = item.children && item.children.length > 0
                    const isExpanded = expandedItems.includes(item.id)
                    const isActive = isActivePath(item.href)

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'transition-all duration-500',
                          mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                        )}
                        style={{
                          transitionDelay: mounted ? `${(index + 1) * 50}ms` : '0ms',
                        }}
                      >
                        {hasChildren ? (
                          <>
                            {/* Parent item with children - expandable */}
                            <button
                              onClick={() => toggleExpanded(item.id)}
                              className={cn(
                                'group flex min-h-[56px] w-full items-center gap-4 rounded-xl px-4 text-left transition-all duration-200',
                                isExpanded
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              {IconComponent && (
                                <div
                                  className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                                    isExpanded
                                      ? 'bg-primary/20 text-primary'
                                      : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/70'
                                  )}
                                >
                                  <IconComponent className="h-5 w-5" />
                                </div>
                              )}
                              <span className="flex-1 text-base font-medium">{item.label}</span>
                              <ChevronDown
                                className={cn(
                                  'h-5 w-5 text-white/40 transition-transform duration-300',
                                  isExpanded && 'rotate-180 text-primary'
                                )}
                              />
                            </button>

                            {/* Children items - animated collapse */}
                            <div
                              className={cn(
                                'overflow-hidden transition-all duration-300 ease-out',
                                isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                              )}
                            >
                              <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-4">
                                {/* View all link */}
                                <Link
                                  href={item.href}
                                  onClick={handleMobileNavClick}
                                  className={cn(
                                    'flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm transition-all duration-200',
                                    isActivePath(item.href)
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                                  )}
                                  {...(item.openInNewTab
                                    ? { target: '_blank', rel: 'noopener noreferrer' }
                                    : {})}
                                >
                                  <span className="text-xs">●</span>
                                  <span>Всі {item.label.toLowerCase()}</span>
                                </Link>
                                {item.children?.map((child, childIndex) => {
                                  const ChildIcon = getNavIcon(child.label)
                                  return (
                                    <Link
                                      key={child.id}
                                      href={child.href}
                                      onClick={handleMobileNavClick}
                                      className={cn(
                                        'flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-sm transition-all duration-200',
                                        isActivePath(child.href)
                                          ? 'bg-primary/10 text-primary'
                                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                                      )}
                                      style={{
                                        transitionDelay: isExpanded
                                          ? `${childIndex * 30}ms`
                                          : '0ms',
                                      }}
                                      {...(child.openInNewTab
                                        ? { target: '_blank', rel: 'noopener noreferrer' }
                                        : {})}
                                    >
                                      {ChildIcon ? (
                                        <ChildIcon className="h-4 w-4 text-white/40" />
                                      ) : (
                                        <span className="text-xs text-white/30">●</span>
                                      )}
                                      <span>{child.label}</span>
                                    </Link>
                                  )
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Single item without children */
                          <Link
                            href={item.href}
                            onClick={handleMobileNavClick}
                            className={cn(
                              'group flex min-h-[56px] items-center gap-4 rounded-xl px-4 transition-all duration-200',
                              isActive
                                ? 'bg-primary/20 text-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            )}
                            {...(item.openInNewTab
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                          >
                            {IconComponent && (
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                                  isActive
                                    ? 'bg-primary/30 text-primary'
                                    : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/70'
                                )}
                              >
                                <IconComponent className="h-5 w-5" />
                              </div>
                            )}
                            <span className="text-base font-medium">{item.label}</span>
                            {isActive && (
                              <div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                            )}
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </nav>

              {/* Language Switcher - Visual pills with flags */}
              <div
                className={cn(
                  'relative border-t border-white/10 px-6 py-6 transition-all duration-500',
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
                style={{ transitionDelay: mounted ? '300ms' : '0ms' }}
              >
                {/* Section label */}
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">
                  Мова / Language
                </p>

                {/* Language pills */}
                <div className="flex gap-2">
                  {languages.map((lang) => {
                    const isCurrentLang = localeString === lang.code
                    return (
                      <Link
                        key={lang.code}
                        href={`/${lang.code}${pathWithoutLocale}`}
                        onClick={handleMobileNavClick}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 transition-all duration-200 active:scale-95',
                          isCurrentLang
                            ? 'bg-gradient-to-br from-primary/30 to-violet-500/20 ring-1 ring-primary/50'
                            : 'bg-white/5 hover:bg-white/10'
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span
                          className={cn(
                            'text-xs font-semibold tracking-wide',
                            isCurrentLang ? 'text-white' : 'text-white/60'
                          )}
                        >
                          {lang.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>

                {/* Current language indicator */}
                <p className="mt-3 text-center text-xs text-white/30">
                  {languages.find((l) => l.code === localeString)?.fullName}
                </p>
              </div>

              {/* Subtle noise texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
