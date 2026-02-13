import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload'

/**
 * Draft Mode Enable Route Handler
 * Enables Next.js draft mode for previewing unpublished content
 *
 * Usage: GET /api/draft?secret=YOUR_SECRET&slug=/path/to/page&collection=pages
 *
 * Query Parameters:
 * - secret: Must match DRAFT_SECRET environment variable
 * - slug: The path to redirect to after enabling draft mode
 * - collection: Optional - 'pages' or 'news' (defaults to 'pages')
 * - locale: Optional - 'uk' or 'en' (defaults to 'uk')
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const collection = searchParams.get('collection') || 'pages'
  const locale = searchParams.get('locale') || 'uk'

  // Validate secret token
  const draftSecret = process.env.DRAFT_SECRET

  if (!draftSecret) {
    return new Response('DRAFT_SECRET environment variable is not set', { status: 500 })
  }

  if (secret !== draftSecret) {
    return new Response('Invalid secret token', { status: 401 })
  }

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 })
  }

  // Verify the content exists in Payload CMS
  try {
    const payload = await getPayload()

    // Normalize slug for querying (remove leading slash and locale prefix)
    let querySlug = slug.startsWith('/') ? slug.slice(1) : slug
    // Remove locale prefix if present
    const localePrefix = `${locale}/`
    if (querySlug.startsWith(localePrefix)) {
      querySlug = querySlug.slice(localePrefix.length)
    }

    // Handle home page
    if (querySlug === '' || querySlug === locale) {
      // Check if home page exists
      const homeResult = await payload.find({
        collection: 'pages',
        where: {
          pageType: {
            equals: 'home',
          },
        },
        locale: locale as 'uk' | 'en',
        limit: 1,
        draft: true,
      })

      if (homeResult.docs.length === 0) {
        return new Response('Home page not found', { status: 404 })
      }
    } else if (collection === 'news') {
      // Check news article exists
      const newsResult = await payload.find({
        collection: 'news',
        where: {
          slug: {
            equals: querySlug,
          },
        },
        locale: locale as 'uk' | 'en',
        limit: 1,
        draft: true,
      })

      if (newsResult.docs.length === 0) {
        return new Response(`News article with slug "${querySlug}" not found`, { status: 404 })
      }
    } else {
      // Check page exists
      const pageResult = await payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: querySlug,
          },
        },
        locale: locale as 'uk' | 'en',
        limit: 1,
        draft: true,
      })

      if (pageResult.docs.length === 0) {
        return new Response(`Page with slug "${querySlug}" not found`, { status: 404 })
      }
    }
  } catch (error) {
    console.error('Error verifying content:', error)
    return new Response('Error verifying content exists', { status: 500 })
  }

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the content page
  // Ensure the path starts with /
  const redirectPath = slug.startsWith('/') ? slug : `/${slug}`
  redirect(redirectPath)
}
