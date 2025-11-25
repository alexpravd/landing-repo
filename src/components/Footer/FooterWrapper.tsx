import { getSiteData, type SupportedLocale } from '@/lib/payload-data'
import { Footer } from './Footer'
import type { FooterData, SiteSettings } from '@/components/Header/types'

interface FooterWrapperProps {
  locale: string
}

export async function FooterWrapper({ locale }: FooterWrapperProps) {
  const { siteSettings, footer } = await getSiteData(locale as SupportedLocale)

  if (!footer || !siteSettings) return null

  return <Footer footerData={footer as FooterData} siteSettings={siteSettings as SiteSettings} />
}
