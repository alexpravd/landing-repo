import { getPayload as getPayloadFromPackage } from 'payload'
import type { CollectionSlug, JsonValue, Payload, Where } from 'payload'

import config from '@payload-config'

/**
 * Get Payload CMS instance
 * Simple wrapper that delegates to Payload's built-in getPayload
 * Payload handles its own caching internally
 */
export async function getPayload(): Promise<Payload> {
  return getPayloadFromPackage({ config })
}

/**
 * Type-safe fetch wrapper for Payload collections
 * @param collection - Collection slug
 * @param options - Query options
 * @returns Collection data
 */
export async function fetchCollection<T>(
  collection: CollectionSlug,
  options?: {
    where?: Where
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

  return data as unknown as { docs: T[]; totalDocs: number; limit: number; page: number }
}

/**
 * Fetch a single document by ID
 * @param collection - Collection slug
 * @param id - Document ID
 * @param depth - Relationship depth
 * @returns Document data
 */
export async function fetchDocumentById<T>(
  collection: CollectionSlug,
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
export async function fetchDocumentByField<T>(
  collection: CollectionSlug,
  field: string,
  value: JsonValue,
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
