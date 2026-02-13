import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Draft Mode Disable Route Handler
 * Disables Next.js draft mode and returns to normal published content view
 *
 * Usage: GET /api/draft/disable?redirect=/path/to/redirect
 *
 * Query Parameters:
 * - redirect: Optional path to redirect to after disabling (defaults to /)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirectPath = searchParams.get('redirect') || '/'

  // Disable draft mode
  const draft = await draftMode()
  draft.disable()

  // Redirect to the specified path or home
  redirect(redirectPath)
}
