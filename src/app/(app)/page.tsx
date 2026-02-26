import { redirect } from 'next/navigation'

/**
 * Root Page - Redirects to default locale
 * Following i18n best practices for Next.js 15 App Router
 */
export default function RootPage() {
  // Redirect to default locale (Ukrainian)
  redirect('/uk')
}
