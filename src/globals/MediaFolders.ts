import type { GlobalConfig } from 'payload'

/**
 * Media Folders Global
 * Stores the folder structure for media organization
 * This is a hidden global used by the Media folder browser
 */
export const MediaFoldersGlobal: GlobalConfig = {
  slug: 'media-folders-config',
  label: 'Media Folders',
  admin: {
    hidden: true, // Hide from admin nav - only used by folder browser
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'folders',
      type: 'array',
      label: 'Folders',
      fields: [
        {
          name: 'path',
          type: 'text',
          required: true,
        },
        {
          name: 'createdAt',
          type: 'date',
        },
      ],
    },
  ],
}
