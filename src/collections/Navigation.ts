import type { CollectionConfig } from 'payload'

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'href', 'order', 'updatedAt'],
    livePreview: {
      url: ({ locale }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        return `${baseUrl}/${locale || 'en'}?preview=true`
      },
    },
    preview: (_doc, { locale }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${baseUrl}/${locale || 'en'}?preview=true`
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Auto-save every 2 seconds
      },
    },
    maxPerDoc: 50, // Keep up to 50 versions per document
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Level 1: Main menu item displayed in header (e.g., About, Services)',
      },
    },
    {
      name: 'linkType',
      type: 'radio',
      required: false,
      defaultValue: 'none',
      admin: {
        description: 'Choose how to link this navigation item (disabled if item has children)',
        layout: 'horizontal',
        condition: (data) => !data.children || data.children.length === 0,
      },
      options: [
        {
          label: 'No Link',
          value: 'none',
        },
        {
          label: 'Page',
          value: 'page',
        },
        {
          label: 'Custom URL',
          value: 'custom',
        },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: false,
      admin: {
        description: 'Select a page to link to',
        condition: (data) => data.linkType === 'page' && (!data.children || data.children.length === 0),
      },
    },
    {
      name: 'href',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description: 'Custom URL (e.g., /about, https://example.com)',
        condition: (data) => data.linkType === 'custom' && (!data.children || data.children.length === 0),
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Order of the navigation item (lower numbers appear first)',
      },
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Open link in a new tab',
      },
    },
    {
      name: 'children',
      type: 'array',
      localized: true,
      admin: {
        description: 'Level 2: Category/group names (e.g., Company, Leadership, News)',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Group/category name',
          },
        },
        {
          name: 'items',
          type: 'array',
          admin: {
            description: 'Level 3: Individual links in this group',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'linkType',
              type: 'radio',
              required: true,
              defaultValue: 'custom',
              admin: {
                description: 'Choose link type',
                layout: 'horizontal',
              },
              options: [
                {
                  label: 'Page',
                  value: 'page',
                },
                {
                  label: 'Custom URL',
                  value: 'custom',
                },
              ],
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              required: false,
              admin: {
                description: 'Select a page to link to',
                condition: (_data, siblingData) => siblingData.linkType === 'page',
              },
            },
            {
              name: 'href',
              type: 'text',
              required: false,
              admin: {
                description: 'Custom URL',
                condition: (_data, siblingData) => siblingData.linkType === 'custom',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
