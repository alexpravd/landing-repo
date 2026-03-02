'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Menu,
  Search,
  Sparkles,
  Home,
  Newspaper,
  Users,
  BookOpen,
  MessageCircle,
} from 'lucide-react'
import { Button } from './ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet'
import { useAccessibility } from './providers/AccessibilityProvider'
import { SearchDialog } from './SearchDialog'

// Types for CMS data - 3-level navigation
interface NavigationItem {
  id: string
  label: string
  href?: string
  openInNewTab?: boolean
  children?: Array<{
    id: string
    label: string
    items?: Array<{
      id: string
      label: string
      href: string
      openInNewTab?: boolean
    }>
  }>
}

interface SocialLink {
  platform:
    | 'facebook'
    | 'twitter'
    | 'instagram'
    | 'linkedin'
    | 'youtube'
    | 'tiktok'
    | 'github'
    | 'discord'
  url: string
  openInNewTab?: boolean
}

interface SiteSettings {
  siteTitle: string
  siteLogo?: {
    url: string
    alt?: string
  }
  tagline?: string
  socialLinks?: SocialLink[]
  hideHeaderControls?: boolean
}

interface HeaderProps {
  siteSettings?: SiteSettings
  navigationItems?: NavigationItem[]
  currentLocale?: string
  /** Whether to show the search button in the header. Defaults to false (disabled). */
  showSearch?: boolean
  /** Whether to hide Social/Locale/A11y controls. Defaults to false. */
  hideHeaderControls?: boolean
}

// Default fallback data
const defaultNavigationData = {
  About: {
    Company: ['Our Story', 'Mission & Vision', 'Team', 'Careers'],
    Leadership: ['Executive Team', 'Board of Directors', 'Advisors'],
    News: ['Press Releases', 'Media Coverage', 'Blog'],
  },
  Services: {
    Consulting: ['Strategy', 'Operations', 'Technology', 'Risk Management'],
    Solutions: ['Digital Transformation', 'Cloud Services', 'Analytics'],
    Support: ['Customer Support', 'Training', 'Documentation'],
  },
  Products: {
    Software: ['Enterprise Suite', 'Mobile Apps', 'Integrations'],
    Hardware: ['Devices', 'Accessories', 'IoT Solutions'],
    Licensing: ['Individual', 'Business', 'Enterprise'],
  },
  Resources: {
    Learning: ['Tutorials', 'Webinars', 'Case Studies'],
    Community: ['Forums', 'Events', 'User Groups'],
    Downloads: ['Software', 'Documentation', 'Templates'],
  },
}

// Helper function to get icon component based on platform
const getSocialIcon = (platform: string) => {
  const icons: Record<string, typeof Facebook | null> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    github: Github,
    tiktok: null, // No tiktok icon in lucide-react
    discord: null, // No discord icon in lucide-react
  }
  return icons[platform] || null
}

export function Header({
  siteSettings,
  navigationItems,
  currentLocale = 'uk',
  showSearch = false,
  hideHeaderControls,
}: HeaderProps = {}) {
  const { fontSize, setFontSize, bwMode, setBwMode } = useAccessibility()
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Ensure currentLocale is always a string - aggressive type checking
  let localeString: string
  if (typeof currentLocale === 'string') {
    localeString = currentLocale
  } else if (currentLocale && typeof currentLocale === 'object') {
    // If it's an object, try to extract a string value
    const localeObj = currentLocale as { code?: string; locale?: string }
    localeString = String(localeObj.code || localeObj.locale || 'uk')
  } else {
    localeString = String(currentLocale || 'uk')
  }

  // Use CMS data if available, otherwise fall back to hardcoded data
  const navigationData = navigationItems || defaultNavigationData

  // Determine site branding
  const siteTitle = siteSettings?.siteTitle || ''
  const siteTagline = siteSettings?.tagline || ''
  const siteLogo = siteSettings?.siteLogo
  const socialLinks = siteSettings?.socialLinks || []
  const showTitleSection = siteTitle || siteTagline

  // Check if header controls should be hidden (prop takes precedence over siteSettings)
  const shouldHideControls = hideHeaderControls ?? siteSettings?.hideHeaderControls ?? false

  return (
    <header className="container sticky top-6 z-50 mx-auto mt-6 rounded-[10px] bg-white/[0.03] px-[52px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-sm [background-image:linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.02)_100%)]">
      <div className="">
        {/* Single Row Header */}
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo + Social/Locale/A11y */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href={`/${localeString}`} className="flex items-center gap-3">
              <div className="relative">
                {siteLogo?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={siteLogo.url} alt={siteLogo.alt || siteTitle} className="h-10 w-auto" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              {showTitleSection && (
                <div>
                  {siteTitle && (
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl tracking-tight text-transparent">
                      {siteTitle}
                    </span>
                  )}
                  {siteTagline && <p className="text-xs text-muted-foreground">{siteTagline}</p>}
                </div>
              )}
            </Link>

            {/* Divider + Social/Locale/A11y Group - conditionally rendered */}
            {!shouldHideControls && (
              <>
                {/* Divider */}
                <div className="hidden h-6 w-px bg-white/20 md:block" />

                {/* Social/Locale/A11y Group */}
                <div className="hidden items-center gap-2 md:flex">
                  {/* Search Button */}
                  {showSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="h-4 w-4" />
                      <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] opacity-100 lg:inline-flex">
                        ⌘K
                      </kbd>
                    </Button>
                  )}

                  {/* Social Icons */}
                  {socialLinks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {socialLinks.map((link, index) => {
                        const IconComponent = getSocialIcon(link.platform)
                        if (!IconComponent) return null

                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-white"
                            asChild
                          >
                            <a
                              href={link.url}
                              target={link.openInNewTab ? '_blank' : undefined}
                              rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            >
                              <IconComponent className="h-4 w-4" />
                            </a>
                          </Button>
                        )
                      })}
                    </div>
                  )}

                  {/* Accessibility Button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground"
                      onClick={() => setShowAccessibility(!showAccessibility)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden lg:inline">A11y</span>
                    </Button>

                    {showAccessibility && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-black/90 p-5 shadow-xl backdrop-blur-md">
                        <div className="space-y-5">
                          <div>
                            <p className="mb-3 text-sm">Font Size</p>
                            <div className="flex gap-2">
                              <Button
                                variant={fontSize === 'small' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFontSize('small')}
                                className="flex-1"
                              >
                                A
                              </Button>
                              <Button
                                variant={fontSize === 'medium' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFontSize('medium')}
                                className="flex-1"
                              >
                                A
                              </Button>
                              <Button
                                variant={fontSize === 'large' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFontSize('large')}
                                className="flex-1"
                              >
                                A
                              </Button>
                            </div>
                          </div>

                          <div>
                            <p className="mb-3 text-sm">Display Mode</p>
                            <Button
                              variant={bwMode ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setBwMode(!bwMode)}
                              className="w-full"
                            >
                              {bwMode ? 'Disable' : 'Enable'} Grayscale
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Navigation + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="flex gap-1">
                {Array.isArray(navigationData)
                  ? navigationData.map((item) => (
                      <NavigationMenuItem key={item.id}>
                        {item.children && item.children.length > 0 ? (
                          <>
                            <NavigationMenuTrigger className="text-base font-medium uppercase leading-none tracking-[-0.02em] text-white/80 hover:text-white data-[state=open]:text-white">
                              {item.label}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <div className="z-50 grid w-[650px] grid-cols-3 gap-8 p-6">
                                {item.children.map((group) => (
                                  <div key={group.id} className="space-y-3">
                                    <p className="text-sm font-medium text-foreground">
                                      {group.label}
                                    </p>
                                    {group.items && group.items.length > 0 && (
                                      <ul className="space-y-2">
                                        {group.items.map((link) => (
                                          <li key={link.id}>
                                            <NavigationMenuLink asChild>
                                              <Link
                                                href={link.href}
                                                className="block py-1 text-sm text-muted-foreground transition-colors hover:text-white"
                                                {...(link.openInNewTab
                                                  ? { target: '_blank', rel: 'noopener noreferrer' }
                                                  : {})}
                                              >
                                                {link.label}
                                              </Link>
                                            </NavigationMenuLink>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href || '#'}
                              className="px-3 py-2 text-base font-medium uppercase leading-none tracking-[-0.02em] text-white/80 hover:text-white"
                            >
                              {item.label}
                            </Link>
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))
                  : Object.entries(navigationData).map(([mainItem, subItems]) => (
                      <NavigationMenuItem key={mainItem}>
                        <NavigationMenuTrigger className="text-base font-medium uppercase leading-none tracking-[-0.02em] text-white/80 hover:text-white data-[state=open]:text-white">
                          {mainItem}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid w-[650px] grid-cols-3 gap-8 p-6">
                            {Object.entries(subItems as Record<string, string[]>).map(
                              ([category, items]) => (
                                <div key={category} className="space-y-3">
                                  <p className="text-sm font-medium text-foreground">{category}</p>
                                  <ul className="space-y-2">
                                    {items.map((item) => (
                                      <li key={item}>
                                        <NavigationMenuLink asChild>
                                          <a
                                            href="#"
                                            className="block py-1 text-sm text-muted-foreground transition-colors hover:text-white"
                                          >
                                            {item}
                                          </a>
                                        </NavigationMenuLink>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            )}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full border-l-0 bg-[#030B06] p-0 sm:max-w-md [&>button]:text-white/60 [&>button]:hover:text-white [&>button]:focus:ring-[#1C3023]"
              >
                {/* Decorative ambient orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#025A4A]/20 blur-3xl" />
                  <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#025A4A]/10 blur-3xl" />
                  <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-[#05B08F]/10 blur-2xl" />
                </div>

                {/* Header section */}
                <div className="relative border-b border-[#1C3023]/60 px-6 pb-6 pt-8">
                  <SheetTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight text-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#025A4A] to-[#05B08F] shadow-lg shadow-[#025A4A]/30">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    {siteTitle}
                  </SheetTitle>
                  <SheetDescription className="mt-2 text-sm text-white/60">
                    {siteTagline}
                  </SheetDescription>
                </div>

                {/* Navigation content */}
                <div className="relative flex-1 overflow-y-auto px-4 py-6">
                  <nav className="space-y-2">
                    {Array.isArray(navigationData)
                      ? // CMS format: 3-level navigation with icons and staggered animation
                        navigationData.map((item, index) => {
                          // Icon selection based on index position for consistent display
                          const iconsList = [Home, Newspaper, Users, BookOpen, MessageCircle]
                          const NavIcon = iconsList[index] || ChevronRight

                          return (
                            <div
                              key={item.id}
                              className="animate-in fade-in slide-in-from-right-4"
                              style={{
                                animationDelay: `${index * 75}ms`,
                                animationFillMode: 'backwards',
                              }}
                            >
                              {/* Main nav item - 48px touch target */}
                              <div className="group flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.03]">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/60 ring-1 ring-white/10 transition-all duration-200 group-hover:bg-[#025A4A]/20 group-hover:text-[#05B08F] group-hover:ring-[#025A4A]/30">
                                  <NavIcon className="h-4 w-4" />
                                </div>
                                <span className="text-base font-medium text-white transition-colors group-hover:text-[#05B08F]">
                                  {item.label}
                                </span>
                              </div>

                              {/* Sub-navigation */}
                              {item.children && item.children.length > 0 && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-[#1C3023] pl-4">
                                  {item.children.map((group) => (
                                    <div key={group.id} className="py-1">
                                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                                        {group.label}
                                      </p>
                                      {group.items && group.items.length > 0 && (
                                        <div className="space-y-0.5">
                                          {group.items.map((link) => (
                                            <Link
                                              key={link.id}
                                              href={link.href}
                                              className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-150 hover:bg-white/[0.05] hover:text-white focus:bg-white/[0.05] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#025A4A]/40"
                                              {...(link.openInNewTab
                                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                                : {})}
                                            >
                                              {link.label}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })
                      : // Hardcoded format with staggered animation
                        Object.entries(navigationData).map(([mainItem, subItems], index) => {
                          // Icon selection based on index position for consistent display
                          const iconsList = [Users, BookOpen, Sparkles, BookOpen]
                          const NavIcon = iconsList[index] || ChevronRight

                          return (
                            <div
                              key={mainItem}
                              className="animate-in fade-in slide-in-from-right-4"
                              style={{
                                animationDelay: `${index * 75}ms`,
                                animationFillMode: 'backwards',
                              }}
                            >
                              {/* Main nav item - 48px touch target */}
                              <div className="group flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/[0.03]">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/60 ring-1 ring-white/10 transition-all duration-200 group-hover:bg-[#025A4A]/20 group-hover:text-[#05B08F] group-hover:ring-[#025A4A]/30">
                                  <NavIcon className="h-4 w-4" />
                                </div>
                                <span className="text-base font-medium text-white transition-colors group-hover:text-[#05B08F]">
                                  {mainItem}
                                </span>
                              </div>

                              {/* Sub-navigation */}
                              <div className="ml-4 mt-1 space-y-1 border-l border-[#1C3023] pl-4">
                                {Object.entries(subItems as Record<string, string[]>).map(
                                  ([category, items]) => (
                                    <div key={category} className="py-1">
                                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                                        {category}
                                      </p>
                                      <div className="space-y-0.5">
                                        {items.map((item) => (
                                          <a
                                            key={item}
                                            href="#"
                                            className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm text-white/70 transition-all duration-150 hover:bg-white/[0.05] hover:text-white focus:bg-white/[0.05] focus:text-white focus:outline-none focus:ring-2 focus:ring-[#025A4A]/40"
                                          >
                                            {item}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog - only rendered when search is enabled */}
      {showSearch && <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />}
    </header>
  )
}
