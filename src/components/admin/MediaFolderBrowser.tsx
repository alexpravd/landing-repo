'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Folder,
  FolderPlus,
  ChevronRight,
  Home,
  X,
  Trash2,
  RefreshCw,
  FileImage,
  FileText,
  ChevronLeft,
  ChevronDown,
  Upload,
} from 'lucide-react'

interface FolderInfo {
  path: string
  count: number
}

interface MediaItem {
  id: string
  filename: string
  alt?: string
  mimeType?: string
  folder?: string
  url?: string
  sizes?: {
    thumbnail?: {
      url?: string
    }
  }
  updatedAt?: string
}

interface FolderData {
  path: string
  name: string
  count: number
}

export function MediaFolderBrowser() {
  const [allFolders, setAllFolders] = useState<FolderInfo[]>([])
  const [currentFolder, setCurrentFolder] = useState('/')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [totalMedia, setTotalMedia] = useState(0)

  // Media items state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [mediaPage, setMediaPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showMediaBrowser, setShowMediaBrowser] = useState(true)
  const mediaPerPage = 20

  const pathname = usePathname()
  const router = useRouter()

  // Fetch folder structure from API
  const fetchFolders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/media-folders')
      const data = await response.json()

      if (data.folders) {
        setAllFolders(data.folders)
        setTotalMedia(data.totalMedia || 0)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      setAllFolders([{ path: '/', count: 0 }])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch media items for current folder
  const fetchMedia = useCallback(async () => {
    setIsLoadingMedia(true)
    try {
      let url = `/api/media?limit=${mediaPerPage}&page=${mediaPage}&depth=0&sort=-updatedAt`

      if (currentFolder !== '/') {
        url += `&where[folder][equals]=${encodeURIComponent(currentFolder)}`
      }

      const response = await fetch(url)
      const data = await response.json()

      setMediaItems(data.docs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching media:', error)
      setMediaItems([])
    } finally {
      setIsLoadingMedia(false)
    }
  }, [currentFolder, mediaPage])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  useEffect(() => {
    if (showMediaBrowser) {
      fetchMedia()
    }
  }, [fetchMedia, showMediaBrowser])

  // Reset page when folder changes
  useEffect(() => {
    setMediaPage(1)
  }, [currentFolder])

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath)
  }

  // Open media item in Payload editor (client-side navigation)
  const openMediaItem = (id: string) => {
    router.push(`${pathname}/${id}`)
  }

  // Upload new media to current folder
  const uploadMedia = () => {
    // Store current folder in localStorage (persists across page loads)
    if (typeof window !== 'undefined') {
      localStorage.setItem('payload-media-upload-folder', currentFolder)
    }
    router.push(`${pathname}/create`)
  }

  // Get subfolders of current folder
  const getSubfolders = (): FolderData[] => {
    const subfolders: FolderData[] = []

    allFolders.forEach((folder) => {
      if (folder.path === '/') return
      if (folder.path === currentFolder) return

      if (currentFolder === '/') {
        const parts = folder.path.split('/').filter(Boolean)
        if (parts.length === 1 && parts[0]) {
          subfolders.push({
            path: folder.path,
            name: parts[0],
            count: folder.count,
          })
        }
      } else {
        if (folder.path.startsWith(currentFolder + '/')) {
          const remaining = folder.path.slice(currentFolder.length + 1)
          if (!remaining.includes('/')) {
            subfolders.push({
              path: folder.path,
              name: remaining || folder.path,
              count: folder.count,
            })
          }
        }
      }
    })

    return subfolders.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Get breadcrumb parts
  const getBreadcrumbs = () => {
    if (currentFolder === '/') return []
    const parts = currentFolder.split('/').filter(Boolean)
    const breadcrumbs: { name: string; path: string }[] = []
    let path = ''
    parts.forEach((part) => {
      path = path + '/' + part
      breadcrumbs.push({ name: part, path })
    })
    return breadcrumbs
  }

  // Get current folder count
  const getCurrentFolderCount = () => {
    if (currentFolder === '/') return totalMedia
    const folder = allFolders.find((f) => f.path === currentFolder)
    return folder?.count || 0
  }

  // Create new folder via API
  const createFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreating(true)
    const newPath =
      currentFolder === '/'
        ? '/' + newFolderName.trim()
        : currentFolder + '/' + newFolderName.trim()

    try {
      const response = await fetch('/api/media-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath }),
      })

      if (response.ok) {
        setShowNewFolder(false)
        setNewFolderName('')
        await fetchFolders()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder')
    } finally {
      setIsCreating(false)
    }
  }

  // Delete folder
  const deleteFolder = async (folderPath: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const folderName = folderPath.split('/').pop()
    if (!confirm(`Delete folder "${folderName}"?\n\nNote: Only empty folders can be deleted.`)) {
      return
    }

    try {
      const response = await fetch('/api/media-folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      })

      if (response.ok) {
        await fetchFolders()
        if (currentFolder === folderPath) {
          navigateToFolder('/')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete folder')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder')
    }
  }

  // Get thumbnail URL
  const getThumbnailUrl = (item: MediaItem) => {
    if (item.sizes?.thumbnail?.url) {
      return item.sizes.thumbnail.url
    }
    return item.url || ''
  }

  // Check if item is an image
  const isImage = (item: MediaItem) => {
    return item.mimeType?.startsWith('image/')
  }

  const subfolders = getSubfolders()
  const breadcrumbs = getBreadcrumbs()
  const currentCount = getCurrentFolderCount()

  return (
    <div className="media-folder-browser">
      <style>{`
        .media-folder-browser {
          background: var(--theme-elevation-50);
          border-bottom: 1px solid var(--theme-elevation-150);
          padding: 16px 24px;
        }

        .folder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .folder-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 14px;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--theme-elevation-500);
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.15s ease;
          font-weight: 500;
        }

        .breadcrumb-item:hover {
          background: var(--theme-elevation-100);
          color: var(--theme-elevation-800);
        }

        .breadcrumb-item.active {
          background: var(--theme-elevation-100);
          color: var(--theme-elevation-800);
        }

        .breadcrumb-separator {
          color: var(--theme-elevation-300);
          flex-shrink: 0;
        }

        .folder-count-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--theme-elevation-500);
          background: var(--theme-elevation-150);
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 4px;
        }

        .folder-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 6px;
          color: var(--theme-elevation-600);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: var(--theme-elevation-100);
          border-color: var(--theme-elevation-300);
          color: var(--theme-elevation-800);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.primary {
          background: var(--theme-elevation-800);
          color: var(--theme-elevation-0);
          border-color: var(--theme-elevation-800);
        }

        .action-btn.primary:hover {
          background: var(--theme-elevation-900);
          border-color: var(--theme-elevation-900);
        }

        .action-btn.icon-only {
          padding: 8px;
        }

        .toggle-btn {
          background: var(--theme-elevation-100);
        }

        .toggle-btn.active {
          background: var(--theme-elevation-800);
          color: var(--theme-elevation-0);
          border-color: var(--theme-elevation-800);
        }

        .folder-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .folder-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: var(--theme-elevation-700);
          min-width: 140px;
        }

        .folder-item:hover {
          background: var(--theme-elevation-50);
          border-color: var(--theme-elevation-300);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .folder-item svg.folder-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .folder-name {
          font-weight: 500;
          flex: 1;
        }

        .folder-item-count {
          font-size: 12px;
          color: var(--theme-elevation-400);
          background: var(--theme-elevation-100);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .folder-delete {
          opacity: 0;
          padding: 4px;
          border: none;
          background: transparent;
          color: var(--theme-elevation-400);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
          margin-left: auto;
        }

        .folder-item:hover .folder-delete {
          opacity: 1;
        }

        .folder-delete:hover {
          background: var(--theme-error-100, #fee2e2);
          color: var(--theme-error-500, #ef4444);
        }

        .new-folder-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 14px;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 8px;
        }

        .new-folder-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--theme-elevation-200);
          border-radius: 6px;
          font-size: 14px;
          background: var(--theme-elevation-50);
          color: var(--theme-elevation-800);
        }

        .new-folder-input:focus {
          outline: none;
          border-color: var(--theme-elevation-400);
        }

        .new-folder-submit {
          padding: 10px 18px;
          background: var(--theme-elevation-800);
          color: var(--theme-elevation-0);
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .new-folder-submit:hover {
          background: var(--theme-elevation-900);
        }

        .new-folder-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .new-folder-cancel {
          padding: 10px;
          background: transparent;
          border: none;
          color: var(--theme-elevation-500);
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 6px;
        }

        .new-folder-cancel:hover {
          background: var(--theme-elevation-100);
          color: var(--theme-elevation-700);
        }

        .empty-folders {
          font-size: 14px;
          color: var(--theme-elevation-400);
          padding: 8px 0;
          margin-bottom: 16px;
        }

        .loading {
          font-size: 14px;
          color: var(--theme-elevation-400);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        /* Media Grid Styles */
        .media-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--theme-elevation-150);
        }

        .media-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .media-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--theme-elevation-700);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .media-item {
          aspect-ratio: 1;
          background: var(--theme-elevation-100);
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .media-item:hover {
          border-color: var(--theme-elevation-400);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .media-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-item-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--theme-elevation-400);
          padding: 8px;
        }

        .media-item-placeholder svg {
          margin-bottom: 4px;
        }

        .media-item-placeholder span {
          font-size: 10px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .media-item-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: white;
          font-size: 10px;
          padding: 16px 6px 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
        }

        .pagination-btn {
          padding: 6px 10px;
          background: var(--theme-elevation-0);
          border: 1px solid var(--theme-elevation-200);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--theme-elevation-600);
          transition: all 0.15s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--theme-elevation-100);
          border-color: var(--theme-elevation-300);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 13px;
          color: var(--theme-elevation-500);
          padding: 0 12px;
        }

        .no-media {
          text-align: center;
          padding: 32px;
          color: var(--theme-elevation-400);
          font-size: 14px;
        }
      `}</style>

      <div className="folder-header">
        <div className="folder-breadcrumbs">
          <div
            className={`breadcrumb-item ${currentFolder === '/' ? 'active' : ''}`}
            onClick={() => navigateToFolder('/')}
          >
            <Home size={16} />
            <span>All Media</span>
            {currentFolder === '/' && <span className="folder-count-badge">{totalMedia}</span>}
          </div>

          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <div
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                onClick={() => navigateToFolder(crumb.path)}
              >
                <Folder size={14} style={{ color: '#f59e0b' }} />
                <span>{crumb.name}</span>
                {index === breadcrumbs.length - 1 && (
                  <span className="folder-count-badge">{currentCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="folder-actions">
          <button
            className={`action-btn toggle-btn ${showMediaBrowser ? 'active' : ''}`}
            onClick={() => setShowMediaBrowser(!showMediaBrowser)}
            title={showMediaBrowser ? 'Hide media grid' : 'Show media grid'}
          >
            <ChevronDown
              size={16}
              style={{
                transform: showMediaBrowser ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          <button
            className="action-btn icon-only"
            onClick={() => {
              fetchFolders()
              fetchMedia()
            }}
            disabled={isLoading || isLoadingMedia}
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading || isLoadingMedia ? 'spinning' : ''} />
          </button>
          <button className="action-btn" onClick={() => setShowNewFolder(true)}>
            <FolderPlus size={16} />
            New Folder
          </button>
          <button className="action-btn primary" onClick={uploadMedia}>
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      {showNewFolder && (
        <div className="new-folder-input-wrapper">
          <Folder size={20} style={{ color: '#f59e0b' }} />
          <input
            type="text"
            className="new-folder-input"
            placeholder="Enter folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isCreating) createFolder()
              if (e.key === 'Escape') {
                setShowNewFolder(false)
                setNewFolderName('')
              }
            }}
            autoFocus
            disabled={isCreating}
          />
          <button
            className="new-folder-submit"
            onClick={createFolder}
            disabled={isCreating || !newFolderName.trim()}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
          <button
            className="new-folder-cancel"
            onClick={() => {
              setShowNewFolder(false)
              setNewFolderName('')
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">
          <RefreshCw size={14} className="spinning" />
          Loading folders...
        </div>
      ) : subfolders.length > 0 ? (
        <div className="folder-grid">
          {subfolders.map((folder) => (
            <div
              key={folder.path}
              className="folder-item"
              onClick={() => navigateToFolder(folder.path)}
            >
              <Folder size={22} className="folder-icon" />
              <span className="folder-name">{folder.name}</span>
              {folder.count > 0 && <span className="folder-item-count">{folder.count}</span>}
              <button
                className="folder-delete"
                onClick={(e) => deleteFolder(folder.path, e)}
                title="Delete folder"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-folders">
          {currentFolder === '/'
            ? 'No folders yet. Click "New Folder" to organize your media.'
            : 'No subfolders in this folder.'}
        </div>
      )}

      {/* Media Grid Section */}
      {showMediaBrowser && (
        <div className="media-section">
          <div className="media-section-header">
            <div className="media-section-title">
              <FileImage size={16} />
              Media in this folder
            </div>
          </div>

          {isLoadingMedia ? (
            <div className="loading">
              <RefreshCw size={14} className="spinning" />
              Loading media...
            </div>
          ) : mediaItems.length > 0 ? (
            <>
              <div className="media-grid">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="media-item"
                    onClick={() => openMediaItem(item.id)}
                    title={item.filename}
                  >
                    {isImage(item) ? (
                      <>
                        <img src={getThumbnailUrl(item)} alt={item.alt || item.filename} />
                        <div className="media-item-name">{item.filename}</div>
                      </>
                    ) : (
                      <div className="media-item-placeholder">
                        <FileText size={32} />
                        <span>{item.filename}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="media-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                    disabled={mediaPage === 1}
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {mediaPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setMediaPage((p) => Math.min(totalPages, p + 1))}
                    disabled={mediaPage === totalPages}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-media">
              No media in this folder. Upload files or move existing media here.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
