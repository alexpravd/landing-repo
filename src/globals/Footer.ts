import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Auto-save every 2 seconds
      },
    },
    // maxPerDoc: 50, // Property not supported in this version
  },
  admin: {
    livePreview: {
      url: ({ data: _data, locale }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        return `${baseUrl}/${locale || 'en'}?preview=true`
      },
    },
    preview: (_doc, { locale }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${baseUrl}/${locale || 'en'}?preview=true`
    },
  },
  fields: [
    {
      name: 'copyrightText',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description: 'Copyright text displayed in the footer',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      localized: true,
      admin: {
        description: 'Footer description or about text',
      },
    },
    {
      name: 'links',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Footer links (localized)',
      },
    },
    {
      name: 'contactColumns',
      type: 'array',
      localized: true,
      maxRows: 3,
      admin: {
        description: 'Contact information columns (up to 3 columns, localized)',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Column title (e.g., "Main Office", "Support", "Sales")',
          },
        },
        {
          name: 'items',
          type: 'array',
          admin: {
            description: 'Contact items in this column',
          },
          fields: [
            {
              name: 'icon',
              type: 'select',
              required: true,
              options: [
                { label: 'Location/Address', value: 'location' },
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'Fax', value: 'fax' },
                { label: 'Time/Hours', value: 'time' },
                { label: 'Link', value: 'link' },
              ],
              admin: {
                description: 'Icon type for this contact item',
              },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                description: 'Contact information text',
              },
            },
            {
              name: 'href',
              type: 'text',
              required: false,
              admin: {
                description: 'Optional link (e.g., tel:, mailto:, or URL)',
                placeholder: 'tel:+1234567890 or mailto:email@example.com',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Open link in new tab',
              },
            },
          ],
        },
      ],
    },
  ],
}
