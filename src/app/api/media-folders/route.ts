import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

interface FolderItem {
  path: string
  createdAt?: string | null
  id?: string | null
}

interface FolderInfo {
  path: string
  count: number
}

/**
 * GET /api/media-folders
 * Returns all folders with counts, derived from actual media data
 */
export async function GET() {
  try {
    const payload = await getPayload()

    // Get ALL media items to build folder structure
    const mediaItems = await payload.find({
      collection: 'media',
      limit: 10000,
      depth: 0,
    })

    // Count media per folder and build folder tree
    const folderCounts: Record<string, number> = { '/': 0 }
    const allFolders = new Set<string>(['/'])

    mediaItems.docs.forEach((doc) => {
      const folder = (doc.folder as string) || '/'

      // Count for this folder
      folderCounts[folder] = (folderCounts[folder] || 0) + 1
      allFolders.add(folder)

      // Count for root (total)
      if (folder !== '/') {
        folderCounts['/'] = (folderCounts['/'] || 0) + 1
      }

      // Add parent folders to tree (but don't count media in them)
      const parts = folder.split('/').filter(Boolean)
      let path = ''
      parts.forEach((part) => {
        path = path + '/' + part
        allFolders.add(path)
        if (!folderCounts[path]) {
          folderCounts[path] = 0
        }
      })
    })

    // Get persisted empty folders from global
    try {
      const foldersConfig = await payload.findGlobal({
        slug: 'media-folders-config',
      })
      const persistedFolders = (foldersConfig.folders as FolderItem[] | undefined) || []
      persistedFolders.forEach((f) => {
        if (!allFolders.has(f.path)) {
          allFolders.add(f.path)
          folderCounts[f.path] = 0
        }
      })
    } catch {
      // Global doesn't exist yet, that's fine
    }

    // Build response
    const folders: FolderInfo[] = Array.from(allFolders)
      .sort()
      .map((path) => ({
        path,
        count: folderCounts[path] || 0,
      }))

    return NextResponse.json({ folders, totalMedia: mediaItems.docs.length })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

/**
 * POST /api/media-folders
 * Creates a new folder
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload()
    const { path: folderPath } = await request.json()

    if (!folderPath || typeof folderPath !== 'string') {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 })
    }

    // Normalize path
    const normalizedPath = folderPath.startsWith('/') ? folderPath : '/' + folderPath

    // Get current folders - handle case where global doesn't exist yet
    let existingFolders: FolderItem[] = []
    try {
      const foldersConfig = await payload.findGlobal({
        slug: 'media-folders-config',
      })
      existingFolders = (foldersConfig.folders as FolderItem[] | undefined) || []
    } catch {
      // Global doesn't exist yet, start fresh
      existingFolders = []
    }

    // Check if folder already exists
    if (existingFolders.some((f) => f.path === normalizedPath)) {
      return NextResponse.json({
        success: true,
        message: 'Folder already exists',
        folders: existingFolders.map((f) => f.path),
      })
    }

    // Add new folder and all parent folders
    const foldersToAdd: FolderItem[] = []
    const parts = normalizedPath.split('/').filter(Boolean)
    let path = ''
    parts.forEach((part) => {
      path = path + '/' + part
      if (!existingFolders.some((f) => f.path === path)) {
        foldersToAdd.push({
          path,
          createdAt: new Date().toISOString(),
        })
      }
    })

    const newFolders = [...existingFolders, ...foldersToAdd]

    // Update global
    await payload.updateGlobal({
      slug: 'media-folders-config',
      data: {
        folders: newFolders,
      },
    })

    return NextResponse.json({
      success: true,
      path: normalizedPath,
      folders: newFolders.map((f) => f.path),
    })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}

/**
 * DELETE /api/media-folders
 * Deletes a folder (only if empty)
 */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload()
    const { path: folderPath } = await request.json()

    if (!folderPath || typeof folderPath !== 'string' || folderPath === '/') {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 })
    }

    // Check if folder has media
    const mediaInFolder = await payload.find({
      collection: 'media',
      where: {
        folder: { equals: folderPath },
      },
      limit: 1,
    })

    if (mediaInFolder.docs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with media. Move or delete media first.' },
        { status: 400 }
      )
    }

    // Check if folder has subfolders
    const foldersConfig = await payload.findGlobal({
      slug: 'media-folders-config',
    })

    const existingFolders = (foldersConfig.folders as FolderItem[] | undefined) || []
    const hasSubfolders = existingFolders.some(
      (f) => f.path !== folderPath && f.path.startsWith(folderPath + '/')
    )

    if (hasSubfolders) {
      return NextResponse.json(
        { error: 'Cannot delete folder with subfolders. Delete subfolders first.' },
        { status: 400 }
      )
    }

    // Remove folder
    const updatedFolders = existingFolders.filter((f) => f.path !== folderPath)

    await payload.updateGlobal({
      slug: 'media-folders-config',
      data: {
        folders: updatedFolders,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}
