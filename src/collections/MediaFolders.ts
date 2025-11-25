import type { CollectionConfig } from 'payload'

/**
 * Media Folders Collection
 * Hierarchical folder structure for organizing media files
 */
export const MediaFolders: CollectionConfig = {
  slug: 'media-folders',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'updatedAt'],
    group: 'Media',
    description: 'Organize media files into folders',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: false,
      admin: {
        description: 'Folder name (e.g., "Products", "Team Photos")',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'media-folders',
      admin: {
        description: 'Parent folder (leave empty for root folder)',
        position: 'sidebar',
      },
      // Prevent circular references
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description of folder contents',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Auto-generated path (read-only)',
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            // Auto-generate slug from name
            if (data?.name) {
              const slugName = data.name
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')

              // If has parent, fetch parent's slug and prepend
              if (data.parent) {
                try {
                  const payload = req.payload
                  const parentId = typeof data.parent === 'string' ? data.parent : data.parent.id

                  const parentFolder = await payload.findByID({
                    collection: 'media-folders',
                    id: parentId,
                  }) as any

                  if (parentFolder?.slug) {
                    return `${parentFolder.slug}/${slugName}`
                  }
                } catch (_error) {
                  // If parent not found, just use name
                  return slugName
                }
              }

              return slugName
            }
            return undefined
          },
        ],
      },
    },
  ],
  timestamps: true,
}
