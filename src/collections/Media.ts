import type { CollectionConfig } from 'payload'

/**
 * Media Collection
 * Unified file and folder management with nested folder support
 * Files and folders live together in one collection
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'folder', 'alt', 'mimeType', 'updatedAt'],
    useAsTitle: 'filename',
    listSearchableFields: ['filename', 'alt', 'caption'],
    description: 'Upload and organize your media files',
    components: {
      // Custom folder browser component for the list view
      beforeList: ['@/components/admin/MediaFolderBrowser#MediaFolderBrowser'],
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        uploadedBy: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'folder',
      type: 'text',
      // Note: defaultValue is handled in the custom field component
      admin: {
        position: 'sidebar',
        description: 'Folder path (e.g., /photos/2024)',
        components: {
          Field: '@/fields/FolderSelectField#FolderSelectField',
        },
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility',
        placeholder: 'Describe the image',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Uploaded by',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          data.uploadedBy = req.user.id
        }
        // Ensure folder path starts with /
        if (data.folder && !data.folder.startsWith('/')) {
          data.folder = '/' + data.folder
        }
        // Default to root folder
        if (!data.folder) {
          data.folder = '/'
        }
        return data
      },
    ],
  },
  timestamps: true,
}
