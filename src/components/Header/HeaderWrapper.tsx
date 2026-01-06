import { getSiteData, type SupportedLocale } from '@/lib/payload-data'
import { Header } from './Header'
import type { NavigationItem, SiteSettings } from './types'

interface HeaderWrapperProps {
  locale: string
}

export async function HeaderWrapper({ locale }: HeaderWrapperProps) {
  const { siteSettings, navigationItems } = await getSiteData(locale as SupportedLocale)

  if (!siteSettings || !navigationItems) return null

  return (
    <Header
      locale={locale}
      siteSettings={siteSettings as SiteSettings}
      navigationItems={navigationItems as NavigationItem[]}
    />
  )
}
