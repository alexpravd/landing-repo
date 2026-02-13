import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

/**
 * Global 404 Not Found page
 * Displayed when a page doesn't exist
 */
export default function NotFound() {
  return (
    <html lang="uk">
      <body>
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gray-100 p-4">
                <FileQuestion className="h-12 w-12 text-gray-500" />
              </div>
            </div>

            <h1 className="mb-2 text-4xl font-bold text-gray-900">404</h1>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Page not found</h2>

            <p className="mb-8 max-w-md text-gray-600">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">Go to homepage</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/news">Browse news</Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
