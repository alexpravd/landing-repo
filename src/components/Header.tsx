'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronDown,
  Globe,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from './ui/sheet'
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
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'discord'
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
}

interface HeaderProps {
  siteSettings?: SiteSettings
  navigationItems?: NavigationItem[]
  currentLocale?: string
  availableLocales?: Array<{ code: string; label: string }>
}

// Default fallback data
const defaultNavigationData = {
  'About': {
    'Company': ['Our Story', 'Mission & Vision', 'Team', 'Careers'],
    'Leadership': ['Executive Team', 'Board of Directors', 'Advisors'],
    'News': ['Press Releases', 'Media Coverage', 'Blog']
  },
  'Services': {
    'Consulting': ['Strategy', 'Operations', 'Technology', 'Risk Management'],
    'Solutions': ['Digital Transformation', 'Cloud Services', 'Analytics'],
    'Support': ['Customer Support', 'Training', 'Documentation']
  },
  'Products': {
    'Software': ['Enterprise Suite', 'Mobile Apps', 'Integrations'],
    'Hardware': ['Devices', 'Accessories', 'IoT Solutions'],
    'Licensing': ['Individual', 'Business', 'Enterprise']
  },
  'Resources': {
    'Learning': ['Tutorials', 'Webinars', 'Case Studies'],
    'Community': ['Forums', 'Events', 'User Groups'],
    'Downloads': ['Software', 'Documentation', 'Templates']
  }
};

const defaultLocales = [
  { code: 'en', label: 'English' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'es', label: 'Spanish' },
];

// Helper function to get icon component based on platform
const getSocialIcon = (platform: string) => {
  const icons: Record<string, any> = {
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
  availableLocales = defaultLocales
}: HeaderProps = {}) {
  const { fontSize, setFontSize, bwMode, setBwMode } = useAccessibility()
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ensure currentLocale is always a string - aggressive type checking
  let localeString: string
  if (typeof currentLocale === 'string') {
    localeString = currentLocale
  } else if (currentLocale && typeof currentLocale === 'object') {
    // If it's an object, try to extract a string value
    localeString = String((currentLocale as any).code || (currentLocale as any).locale || 'uk')
  } else {
    localeString = String(currentLocale || 'uk')
  }

  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Header locale debug:', { currentLocale, localeString, type: typeof currentLocale })
  }

  // Use CMS data if available, otherwise fall back to hardcoded data
  const navigationData = navigationItems || defaultNavigationData;

  // Determine site branding
  const siteTitle = siteSettings?.siteTitle || 'TechCorp'
  const siteTagline = siteSettings?.tagline || 'Innovation Studio'
  const siteLogo = siteSettings?.siteLogo
  const socialLinks = siteSettings?.socialLinks || []

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-8">
            <Link href={`/${localeString}`} className="flex items-center gap-3">
              <div className="relative">
                {siteLogo?.url ? (
                  <Image
                    src={siteLogo.url}
                    alt={siteLogo.alt || siteTitle}
                    width={40}
                    height={40}
                    className=""
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <span className="text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{siteTitle}</span>
                <p className="text-xs text-gray-500">{siteTagline}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hidden md:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm text-gray-600">Search</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] opacity-100">
                ⌘K
              </kbd>
            </Button>

            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <>
                <div className="hidden md:flex items-center gap-1">
                  {socialLinks.map((link, index) => {
                    const IconComponent = getSocialIcon(link.platform)
                    if (!IconComponent) return null

                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-indigo-600"
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
                <div className="w-px h-6 bg-gray-200 hidden md:block" />
              </>
            )}

            {/* Locale Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{localeString.toUpperCase()}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableLocales.map((locale) => (
                  <DropdownMenuItem key={locale.code} asChild>
                    <Link href={`/${locale.code}`}>
                      {locale.label}
                      {locale.code === localeString && ' ✓'}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Accessibility Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600"
                onClick={() => setShowAccessibility(!showAccessibility)}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">A11y</span>
              </Button>

              {showAccessibility && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-5 w-72 z-50">
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

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Browse through our main navigation sections
                </SheetDescription>
                <div className="space-y-4 mt-4">
                  {Array.isArray(navigationData) ? (
                    // CMS format: 3-level navigation
                    navigationData.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.children && item.children.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {item.children.map((group) => (
                              <div key={group.id}>
                                <p className="text-sm text-gray-600">{group.label}</p>
                                {group.items && group.items.length > 0 && (
                                  <div className="ml-4 space-y-1">
                                    {group.items.map((link) => (
                                      <Link
                                        key={link.id}
                                        href={link.href}
                                        className="block text-sm text-gray-500 py-1 hover:text-indigo-600"
                                        {...(link.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
                    ))
                  ) : (
                    // Hardcoded format
                    Object.entries(navigationData).map(([mainItem, subItems]) => (
                      <div key={mainItem} className="space-y-2">
                        <p className="text-sm font-medium">{mainItem}</p>
                        {Object.entries(subItems as any).map(([category, items]) => (
                          <div key={category} className="ml-4 space-y-1">
                            <p className="text-sm text-gray-600">{category}</p>
                            {(items as string[]).map((item) => (
                              <a key={item} href="#" className="block text-sm text-gray-500 ml-4 py-1 hover:text-indigo-600">
                                {item}
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="hidden md:flex items-center justify-between py-3">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-1">
              {Array.isArray(navigationData) ? (
                // CMS format: 3-level navigation array
                navigationData.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <NavigationMenuTrigger className="text-sm hover:text-indigo-600 data-[state=open]:text-indigo-600">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid grid-cols-3 gap-8 p-6 w-[650px] z-50">
                            {item.children.map((group) => (
                              <div key={group.id} className="space-y-3">
                                <p className="text-sm text-gray-900">{group.label}</p>
                                {group.items && group.items.length > 0 && (
                                  <ul className="space-y-2">
                                    {group.items.map((link) => (
                                      <li key={link.id}>
                                        <NavigationMenuLink asChild>
                                          <Link
                                            href={link.href}
                                            className="block text-sm text-gray-600 hover:text-indigo-600 py-1 transition-colors"
                                            {...(link.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
                      <Link href={item.href || '#'} passHref legacyBehavior>
                        <NavigationMenuLink className="text-sm hover:text-indigo-600 px-3 py-2">
                          {item.label}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))
              ) : (
                // Hardcoded format: nested object
                Object.entries(navigationData).map(([mainItem, subItems]) => (
                  <NavigationMenuItem key={mainItem}>
                    <NavigationMenuTrigger className="text-sm hover:text-indigo-600 data-[state=open]:text-indigo-600">
                      {mainItem}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid grid-cols-3 gap-8 p-6 w-[650px]">
                        {Object.entries(subItems as any).map(([category, items]) => (
                          <div key={category} className="space-y-3">
                            <p className="text-sm text-gray-900">{category}</p>
                            <ul className="space-y-2">
                              {(items as string[]).map((item) => (
                                <li key={item}>
                                  <NavigationMenuLink asChild>
                                    <a
                                      href="#"
                                      className="block text-sm text-gray-600 hover:text-indigo-600 py-1 transition-colors"
                                    >
                                      {item}
                                    </a>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
