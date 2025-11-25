import type { CollectionConfig } from 'payload'

/**
 * Media Collection
 * Handles file uploads and media management
 * Following Payload CMS 3.0 best practices
 */
export const Media: CollectionConfig = {
  slug: 'media',
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
    group: 'Media',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    useAsTitle: 'filename',
  },
  access: {
    // Public read access
    read: () => true,
    // Authenticated users can create
    create: ({ req: { user } }) => !!user,
    // Users can update their own uploads, admins can update all
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        uploadedBy: {
          equals: user.id,
        },
      }
    },
    // Only admins can delete
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'media-folders',
      admin: {
        description: 'Organize this file into a folder',
        position: 'sidebar',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility (required for images)',
        placeholder: 'Describe the image',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption to display with the image',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'User who uploaded this file',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            // Automatically set uploadedBy on creation
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
        // Set uploadedBy field on creation
        if (operation === 'create' && req.user) {
          data.uploadedBy = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
