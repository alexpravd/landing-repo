import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Auto-save every 2 seconds
      },
    },
    max: 50, // Keep up to 50 versions per document
  },
  admin: {
    livePreview: {
      url: ({ locale }) => {
        // Generate preview URL based on locale
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        return `${baseUrl}/${locale || 'uk'}?preview=true`
      },
    },
    preview: (_doc, { locale }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${baseUrl}/${locale || 'uk'}?preview=true`
    },
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description: 'The main site title displayed in the header (optional)',
      },
    },
    {
      name: 'siteLogo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Site logo displayed in the header (not localized)',
      },
    },
    {
      name: 'logoHeight',
      type: 'number',
      required: false,
      defaultValue: 40,
      min: 16,
      max: 120,
      admin: {
        description:
          'Logo height in pixels (16–120). Width adjusts automatically to maintain aspect ratio.',
        condition: (data) => Boolean(data?.siteLogo),
      },
    },
    {
      name: 'logoAltText',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description: 'Alt text for the logo image',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      required: false,
      localized: true,
      admin: {
        description: 'Optional tagline displayed below the title',
      },
    },
    {
      name: 'hideHeaderControls',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide Social links, Locale switcher, and Accessibility controls in the header',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      required: false,
      admin: {
        description: 'Social media links (not localized) - Add/remove as needed',
        condition: (data) => !data?.hideHeaderControls,
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'GitHub', value: 'github' },
            { label: 'Discord', value: 'discord' },
          ],
          admin: {
            description: 'Select the social media platform',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Full URL to your social media profile',
            placeholder: 'https://facebook.com/yourpage',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Open link in a new tab',
          },
        },
      ],
    },
  ],
}
