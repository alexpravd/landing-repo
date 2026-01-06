export interface SiteSettings {
  siteTitle: string
  siteLogo?: {
    url: string
    alt?: string
  }
  logoAltText?: string
  tagline?: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  openInNewTab?: boolean
  children?: Array<{
    id: string
    label: string
    href: string
    openInNewTab?: boolean
  }>
}

export interface FooterData {
  copyrightText?: string
  description?: string
  links?: Array<{
    label: string
    href: string
    openInNewTab?: boolean
  }>
  columns?: Array<{
    title: string
    links?: Array<{
      label: string
      href: string
      openInNewTab?: boolean
    }>
  }>
}
