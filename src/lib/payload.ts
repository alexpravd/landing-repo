import { getPayload as getPayloadInstance } from 'payload'
import configPromise from '@/payload.config'

/**
 * Get Payload CMS instance
 * Cached instance to avoid multiple initializations
 * Following Payload CMS 3.0 best practices for Next.js integration
 */
let cachedPayload: Awaited<ReturnType<typeof getPayloadInstance>> | null = null

export async function getPayload() {
  if (cachedPayload) {
    return cachedPayload
  }

  const config = await configPromise
  cachedPayload = await getPayloadInstance({ config })

  return cachedPayload
}

/**
 * Type-safe fetch wrapper for Payload collections
 * @param collection - Collection slug
 * @param options - Query options
 * @returns Collection data
 */
export async function fetchCollection<T = any>(
  collection: any,
  options?: {
    where?: Record<string, any>
    limit?: number
    page?: number
    sort?: string
    depth?: number
  }
) {
  const payload = await getPayload()

  const data = await payload.find({
    collection,
    ...options,
  })

  return data as any as { docs: T[]; totalDocs: number; limit: number; page: number }
}

/**
 * Fetch a single document by ID
 * @param collection - Collection slug
 * @param id - Document ID
 * @param depth - Relationship depth
 * @returns Document data
 */
export async function fetchDocumentById<T = any>(
  collection: any,
  id: string,
  depth: number = 1
) {
  const payload = await getPayload()

  const data = await payload.findByID({
    collection,
    id,
    depth,
  })

  return data as T
}

/**
 * Fetch a single document by field value
 * @param collection - Collection slug
 * @param field - Field name
 * @param value - Field value
 * @param depth - Relationship depth
 * @returns Document data or null
 */
export async function fetchDocumentByField<T = any>(
  collection: any,
  field: string,
  value: any,
  depth: number = 1
) {
  const payload = await getPayload()

  const data = await payload.find({
    collection,
    where: {
      [field]: {
        equals: value,
      },
    },
    limit: 1,
    depth,
  })

  return data.docs.length > 0 ? (data.docs[0] as T) : null
}
