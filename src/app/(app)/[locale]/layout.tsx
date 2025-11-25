import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getSiteData, type SupportedLocale } from '@/lib/payload-data'

// Force dynamic rendering - this layout uses searchParams for preview mode
export const dynamic = 'force-dynamic'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ preview?: string }>
}

const availableLocales = [
  { code: 'uk', label: 'Ukrainian' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
]

/**
 * Localized Layout
 * Fetches data from Payload CMS and passes to Header and Footer components
 * Falls back to hardcoded defaults if CMS data is unavailable
 * AccessibilityProvider is in parent layout
 */
export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { children, searchParams } = props
  const params = await props.params
  const { locale } = params

  // Debug what we're getting
  console.log('🔍 Layout locale debug:', {
    locale,
    type: typeof locale,
    isObject: typeof locale === 'object',
    keys: typeof locale === 'object' ? Object.keys(locale as any) : null,
    stringified: JSON.stringify(locale),
  })

  // Ensure locale is always a string - aggressive extraction
  let localeString: string
  if (typeof locale === 'string') {
    localeString = locale
  } else if (locale && typeof locale === 'object') {
    // If it's an object, try to extract the actual locale value
    const localeObj = locale as any
    localeString = localeObj.locale || localeObj.code || localeObj.value || 'uk'
    console.warn('⚠️ Locale was an object, extracted:', localeString)
  } else {
    localeString = 'uk'
  }

  // Check if preview mode is enabled
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const isPreview = resolvedSearchParams.preview === 'true'

  // Try to fetch CMS data, fall back to undefined if not available
  let siteSettings, navigationItems, footer
  try {
    const data = await getSiteData(localeString as SupportedLocale, isPreview)
    siteSettings = data.siteSettings
    navigationItems = data.navigationItems
    footer = data.footer
  } catch (error) {
    // CMS data not available yet - components will use hardcoded defaults
    console.log('CMS data not available, using defaults')
  }

  return (
    <>
      {isPreview && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium sticky top-0 z-[100]">
          Preview Mode - Locale: {localeString} (type: {typeof locale})
        </div>
      )}
      <Header
        siteSettings={siteSettings}
        navigationItems={navigationItems as any}
        currentLocale={localeString}
        availableLocales={availableLocales}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteSettings={siteSettings}
        footerData={footer}
      />
    </>
  )
}
