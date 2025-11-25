import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Payload Platform',
    template: '%s | Payload Platform',
  },
  description: 'Modern platform built with Next.js and Payload CMS',
  keywords: ['Next.js', 'Payload CMS', 'React', 'TypeScript'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Organization',
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: process.env.NEXT_PUBLIC_SERVER_URL,
    siteName: 'Payload Platform',
    title: 'Payload Platform',
    description: 'Modern platform built with Next.js and Payload CMS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Payload Platform',
    description: 'Modern platform built with Next.js and Payload CMS',
  },
  robots: {
    index: true,
    follow: true,
  },
}

/**
 * App Layout
 * Wraps the main application with providers and shared layouts
 * This is a server component that wraps client components
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  )
}
