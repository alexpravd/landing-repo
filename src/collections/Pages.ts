import type { CollectionConfig, SelectField, TextField, ValidateOptions } from 'payload'
import type { Page } from '@/payload-types'
import { generateSlug } from '@/lib/transliterate'

// Payload locale can be string or object with code/locale property
type PayloadLocale = string | { code?: string; locale?: string } | undefined

function extractLocaleString(locale: PayloadLocale): string {
  if (typeof locale === 'string') return locale
  if (locale && typeof locale === 'object') {
    return locale.code || locale.locale || 'uk'
  }
  return 'uk'
}

/** Reusable anchor-id field added to every block so editors can target it via #hash links. */
const anchorIdField: TextField = {
  name: 'anchorId',
  type: 'text',
  admin: {
    description: 'Optional anchor ID for in-page linking (e.g. "services"  →  #services)',
  },
}

/**
 * Pages Collection
 * Flexible page management system with multiple page types
 * Can be assigned to navigation items or linked from anywhere
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'slug', 'status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data, locale }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        // Ensure locale is a string - Payload might pass it as an object
        const docLocale = extractLocaleString(locale as PayloadLocale)

        // Handle home page specially
        if (data.pageType === 'home') {
          return `${baseUrl}/${docLocale}?preview=true`
        }
        const slug = data.slug || ''
        return `${baseUrl}/${docLocale}/${slug}?preview=true`
      },
    },
    preview: (doc, { locale }) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

      // Ensure locale is a string - Payload might pass it as an object
      const docLocale = extractLocaleString(locale as PayloadLocale)

      // Handle home page specially
      if (doc.pageType === 'home') {
        return `${baseUrl}/${docLocale}?preview=true`
      }
      const slug = doc.slug || ''
      return `${baseUrl}/${docLocale}/${slug}?preview=true`
    },
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published pages
      if (!user) {
        return {
          status: {
            equals: 'published',
          },
        }
      }
      // Admins can read all
      return true
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, operation }) => {
        // Fix missing id on update — admin panel sends id in URL, not body
        if (operation === 'update' && !data?.id && originalDoc?.id) {
          if (data) data.id = originalDoc.id
        }

        // Clean up conditional array fields in caseCardsBlock
        if (data?.blocks) {
          for (const block of data.blocks) {
            if (block.blockType === 'caseCardsBlock') {
              if (block.displayMode === 'reviews') {
                block.cases = []
              } else {
                block.reviews = []
              }
            }
          }
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Page title (displayed in browser tab and page header)',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      required: true,
      defaultValue: 'text',
      admin: {
        description:
          'Type of page - determines layout and available features. Only one Home page allowed.',
      },
      options: [
        {
          label: 'Home',
          value: 'home',
        },
        {
          label: 'News',
          value: 'news',
        },
        {
          label: 'Leadership',
          value: 'leadership',
        },
        {
          label: 'Departments',
          value: 'departments',
        },
        {
          label: 'Documents',
          value: 'documents',
        },
        {
          label: 'Text',
          value: 'text',
        },
      ],
      validate: async (
        value: string | null | undefined,
        options: ValidateOptions<unknown, unknown, SelectField, string>
      ) => {
        const { req, operation, id } = options
        // Only allow one home page
        if (value === 'home') {
          const payload = req.payload

          try {
            const existingHome = await payload.find({
              collection: 'pages',
              where: {
                pageType: {
                  equals: 'home',
                },
                // Exclude current document if updating
                ...(id
                  ? {
                      id: {
                        not_equals: id,
                      },
                    }
                  : {}),
              },
              limit: 1,
            })

            if (existingHome.docs.length > 0) {
              return 'Only one home page is allowed. Please change the existing home page first.'
            }
          } catch {
            // If validation fails during create, allow it
            // The error might occur during initial setup
            if (operation === 'create') {
              return true
            }
          }
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: {
        description: 'Publication status',
      },
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        description:
          'URL-friendly identifier (e.g., "about-us", "leadership"). Auto-generated from title with Cyrillic transliteration. Not required for home page.',
        placeholder: 'url-friendly-slug',
        condition: (data) => data.pageType !== 'home',
      },
      validate: (
        value: string | null | undefined,
        { data }: ValidateOptions<Page, unknown, TextField, string>
      ) => {
        // Slug is required for all page types except home
        if (data?.pageType !== 'home' && !value) {
          return 'Slug is required for this page type'
        }
        return true
      },
      hooks: {
        beforeValidate: [
          ({ value, data, operation, originalDoc }) => {
            // For home page, always set slug to 'home'
            if (data?.pageType === 'home') {
              return 'home'
            }

            // Auto-generate slug from title if:
            // 1. Creating a new document, OR
            // 2. Slug is empty, OR
            // 3. Slug matches what would be generated from title (auto-sync mode)
            const currentTitle = data?.title || ''
            const currentSlug = value || ''
            const autoGeneratedSlug = generateSlug(currentTitle)

            // On create, always auto-generate from title
            if (operation === 'create') {
              return autoGeneratedSlug
            }

            // On update, regenerate if slug is empty or matches auto-generated pattern
            if (operation === 'update') {
              // If slug is empty, generate from title
              if (!currentSlug) {
                return autoGeneratedSlug
              }

              // If slug matches what would be generated from current title, keep it in sync
              if (currentSlug === autoGeneratedSlug) {
                return autoGeneratedSlug
              }

              // If slug was previously auto-generated from old title, update to new title
              if (originalDoc?.title) {
                const oldAutoSlug = generateSlug(originalDoc.title)
                if (currentSlug === oldAutoSlug) {
                  return autoGeneratedSlug
                }
              }

              // Otherwise, user has manually edited slug, keep it
              return currentSlug
            }

            return value
          },
        ],
      },
    },
    // Tabs for organized content management
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          description: 'Page content and layout blocks',
          fields: [
            {
              name: 'blocks',
              type: 'blocks',
              localized: true,
              admin: {
                description: 'Flexible content blocks for advanced layouts',
              },
              blocks: [
                {
                  slug: 'heroBlock',
                  labels: {
                    singular: 'Hero Block',
                    plural: 'Hero Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'headline',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: {
                        description: 'Main headline (H1) - the primary message',
                      },
                    },
                    {
                      name: 'subheadline',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Supporting text below the headline',
                      },
                    },
                    {
                      name: 'primaryCTA',
                      type: 'group',
                      admin: {
                        description: 'Primary call-to-action button',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Button text (e.g., "Get Started", "Learn More")',
                          },
                        },
                        {
                          name: 'linkType',
                          type: 'radio',
                          defaultValue: 'external',
                          admin: {
                            description: 'Choose link type',
                            layout: 'horizontal',
                          },
                          options: [
                            { label: 'Page', value: 'page' },
                            { label: 'External URL', value: 'external' },
                            { label: 'Anchor', value: 'anchor' },
                          ],
                        },
                        {
                          name: 'page',
                          type: 'relationship',
                          relationTo: 'pages',
                          admin: {
                            description: 'Select a page to link to',
                            condition: (_data, siblingData) => siblingData?.linkType === 'page',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'External URL (e.g., https://example.com)',
                            condition: (_data, siblingData) =>
                              !siblingData?.linkType || siblingData?.linkType === 'external',
                          },
                        },
                        {
                          name: 'anchor',
                          type: 'text',
                          admin: {
                            description: 'Anchor ID without # (e.g., "contact-section")',
                            condition: (_data, siblingData) => siblingData?.linkType === 'anchor',
                          },
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'solid',
                          options: [
                            { label: 'Solid', value: 'solid' },
                            { label: 'Outline', value: 'outline' },
                          ],
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            condition: (_data, siblingData) => siblingData?.linkType !== 'anchor',
                          },
                        },
                      ],
                    },
                    {
                      name: 'secondaryCTA',
                      type: 'group',
                      admin: {
                        description: 'Secondary call-to-action button (optional)',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Button text',
                          },
                        },
                        {
                          name: 'linkType',
                          type: 'radio',
                          defaultValue: 'external',
                          admin: {
                            description: 'Choose link type',
                            layout: 'horizontal',
                          },
                          options: [
                            { label: 'Page', value: 'page' },
                            { label: 'External URL', value: 'external' },
                            { label: 'Anchor', value: 'anchor' },
                          ],
                        },
                        {
                          name: 'page',
                          type: 'relationship',
                          relationTo: 'pages',
                          admin: {
                            description: 'Select a page to link to',
                            condition: (_data, siblingData) => siblingData?.linkType === 'page',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'External URL (e.g., https://example.com)',
                            condition: (_data, siblingData) =>
                              !siblingData?.linkType || siblingData?.linkType === 'external',
                          },
                        },
                        {
                          name: 'anchor',
                          type: 'text',
                          admin: {
                            description: 'Anchor ID without # (e.g., "contact-section")',
                            condition: (_data, siblingData) => siblingData?.linkType === 'anchor',
                          },
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'outline',
                          options: [
                            { label: 'Solid', value: 'solid' },
                            { label: 'Outline', value: 'outline' },
                          ],
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            condition: (_data, siblingData) => siblingData?.linkType !== 'anchor',
                          },
                        },
                      ],
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Enable entrance animations',
                      },
                    },
                  ],
                },
                {
                  slug: 'faqBlock',
                  labels: {
                    singular: 'FAQ Block',
                    plural: 'FAQ Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the FAQ',
                      },
                    },
                    {
                      name: 'questions',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Frequently asked questions and answers',
                      },
                      labels: {
                        singular: 'Question',
                        plural: 'Questions',
                      },
                      fields: [
                        {
                          name: 'question',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'The question text',
                          },
                        },
                        {
                          name: 'answer',
                          type: 'textarea',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'The answer text',
                          },
                        },
                      ],
                    },
                    {
                      name: 'allowMultiple',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        description: 'Allow multiple FAQ items to be open at the same time',
                      },
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Enable entrance animations',
                      },
                    },
                  ],
                },
                {
                  slug: 'sectionHeader',
                  labels: {
                    singular: 'Section Header',
                    plural: 'Section Headers',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'centered',
                      admin: {
                        description: 'Text alignment and layout direction',
                      },
                      options: [
                        { label: 'Centered', value: 'centered' },
                        { label: 'Left Aligned', value: 'left' },
                        { label: 'Right Aligned', value: 'right' },
                      ],
                    },
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Main heading text (optional)',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Secondary text below the title (optional)',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Additional description text (optional)',
                      },
                    },
                    {
                      name: 'primaryCTA',
                      type: 'group',
                      admin: {
                        description: 'Primary call-to-action button',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Button text (e.g., "Get Started", "Learn More")',
                          },
                        },
                        {
                          name: 'linkType',
                          type: 'radio',
                          defaultValue: 'external',
                          admin: {
                            description: 'Choose link type',
                            layout: 'horizontal',
                          },
                          options: [
                            { label: 'Page', value: 'page' },
                            { label: 'External URL', value: 'external' },
                            { label: 'Anchor', value: 'anchor' },
                          ],
                        },
                        {
                          name: 'page',
                          type: 'relationship',
                          relationTo: 'pages',
                          admin: {
                            description: 'Select a page to link to',
                            condition: (_data, siblingData) => siblingData?.linkType === 'page',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'External URL (e.g., https://example.com)',
                            condition: (_data, siblingData) =>
                              !siblingData?.linkType || siblingData?.linkType === 'external',
                          },
                        },
                        {
                          name: 'anchor',
                          type: 'text',
                          admin: {
                            description: 'Anchor ID without # (e.g., "contact-section")',
                            condition: (_data, siblingData) => siblingData?.linkType === 'anchor',
                          },
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'solid',
                          options: [
                            { label: 'Solid', value: 'solid' },
                            { label: 'Outline', value: 'outline' },
                          ],
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            condition: (_data, siblingData) => siblingData?.linkType !== 'anchor',
                          },
                        },
                      ],
                    },
                    {
                      name: 'secondaryCTA',
                      type: 'group',
                      admin: {
                        description: 'Secondary call-to-action button (optional)',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Button text',
                          },
                        },
                        {
                          name: 'linkType',
                          type: 'radio',
                          defaultValue: 'external',
                          admin: {
                            description: 'Choose link type',
                            layout: 'horizontal',
                          },
                          options: [
                            { label: 'Page', value: 'page' },
                            { label: 'External URL', value: 'external' },
                            { label: 'Anchor', value: 'anchor' },
                          ],
                        },
                        {
                          name: 'page',
                          type: 'relationship',
                          relationTo: 'pages',
                          admin: {
                            description: 'Select a page to link to',
                            condition: (_data, siblingData) => siblingData?.linkType === 'page',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'External URL (e.g., https://example.com)',
                            condition: (_data, siblingData) =>
                              !siblingData?.linkType || siblingData?.linkType === 'external',
                          },
                        },
                        {
                          name: 'anchor',
                          type: 'text',
                          admin: {
                            description: 'Anchor ID without # (e.g., "contact-section")',
                            condition: (_data, siblingData) => siblingData?.linkType === 'anchor',
                          },
                        },
                        {
                          name: 'style',
                          type: 'select',
                          defaultValue: 'outline',
                          options: [
                            { label: 'Solid', value: 'solid' },
                            { label: 'Outline', value: 'outline' },
                          ],
                        },
                        {
                          name: 'openInNewTab',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            condition: (_data, siblingData) => siblingData?.linkType !== 'anchor',
                          },
                        },
                      ],
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Enable fade-in animation on page load',
                      },
                    },
                  ],
                },
                {
                  slug: 'serviceCardsBlock',
                  labels: {
                    singular: 'Service Cards Block',
                    plural: 'Service Cards Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Section heading, e.g. "ПОСЛУГИ"',
                      },
                    },
                    {
                      name: 'cards',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          localized: true,
                          required: true,
                        },
                        {
                          name: 'bulletPoints',
                          type: 'array',
                          minRows: 1,
                          fields: [
                            {
                              name: 'text',
                              type: 'text',
                              localized: true,
                              required: true,
                            },
                          ],
                        },
                        {
                          name: 'ctaLabel',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Button text',
                          },
                        },
                        {
                          name: 'ctaLinkType',
                          type: 'radio',
                          defaultValue: 'external',
                          admin: {
                            description: 'Choose link type',
                            layout: 'horizontal',
                          },
                          options: [
                            { label: 'Page', value: 'page' },
                            { label: 'External URL', value: 'external' },
                            { label: 'Anchor', value: 'anchor' },
                          ],
                        },
                        {
                          name: 'ctaPage',
                          type: 'relationship',
                          relationTo: 'pages',
                          admin: {
                            description: 'Select a page to link to',
                            condition: (_data, siblingData) => siblingData?.ctaLinkType === 'page',
                          },
                        },
                        {
                          name: 'ctaUrl',
                          type: 'text',
                          admin: {
                            description: 'External URL (e.g., https://example.com)',
                            condition: (_data, siblingData) =>
                              siblingData?.ctaLinkType === 'external',
                          },
                        },
                        {
                          name: 'ctaAnchor',
                          type: 'text',
                          admin: {
                            description: 'Anchor ID without # (e.g., "contact-section")',
                            condition: (_data, siblingData) =>
                              siblingData?.ctaLinkType === 'anchor',
                          },
                        },
                        {
                          name: 'ctaOpenInNewTab',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.ctaLinkType !== 'anchor',
                          },
                        },
                      ],
                    },
                    {
                      name: 'tags',
                      type: 'array',
                      admin: {
                        description: 'Tags displayed below the cards',
                      },
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                      ],
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  slug: 'aboutBlock',
                  labels: {
                    singular: 'About Block',
                    plural: 'About Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Section heading (e.g. "ПРО НАС")',
                      },
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'Left-column image',
                      },
                    },
                    {
                      name: 'badges',
                      type: 'array',
                      admin: {
                        description: 'Pill-shaped badges with emoji + text',
                      },
                      fields: [
                        {
                          name: 'emoji',
                          type: 'text',
                          admin: {
                            description: 'Emoji icon (e.g. 🏛️)',
                          },
                        },
                        {
                          name: 'text',
                          type: 'text',
                          localized: true,
                          required: true,
                        },
                      ],
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description:
                          'Main description text. Use double newlines for separate paragraphs.',
                      },
                    },
                    {
                      name: 'ctaLabel',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Button text',
                      },
                    },
                    {
                      name: 'ctaLinkType',
                      type: 'radio',
                      defaultValue: 'external',
                      admin: {
                        description: 'Choose link type',
                        layout: 'horizontal',
                      },
                      options: [
                        { label: 'Page', value: 'page' },
                        { label: 'External URL', value: 'external' },
                        { label: 'Anchor', value: 'anchor' },
                      ],
                    },
                    {
                      name: 'ctaPage',
                      type: 'relationship',
                      relationTo: 'pages',
                      admin: {
                        description: 'Select a page to link to',
                        condition: (_data, siblingData) => siblingData?.ctaLinkType === 'page',
                      },
                    },
                    {
                      name: 'ctaUrl',
                      type: 'text',
                      admin: {
                        description: 'External URL (e.g., https://example.com)',
                        condition: (_data, siblingData) =>
                          !siblingData?.ctaLinkType || siblingData?.ctaLinkType === 'external',
                      },
                    },
                    {
                      name: 'ctaAnchor',
                      type: 'text',
                      admin: {
                        description: 'Anchor ID without # (e.g., "contact-section")',
                        condition: (_data, siblingData) => siblingData?.ctaLinkType === 'anchor',
                      },
                    },
                    {
                      name: 'ctaOpenInNewTab',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        condition: (_data, siblingData) => siblingData?.ctaLinkType !== 'anchor',
                      },
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  slug: 'valueCardsBlock',
                  labels: {
                    singular: 'Value Cards Block',
                    plural: 'Value Cards Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section heading',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional description shown below the title',
                      },
                    },
                    {
                      name: 'tags',
                      type: 'array',
                      admin: {
                        description: 'Optional pill-shaped tags displayed below the description',
                      },
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                      ],
                    },
                    {
                      name: 'cards',
                      type: 'array',
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                      ],
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
                {
                  slug: 'caseCardsBlock',
                  labels: {
                    singular: 'Case Cards Block',
                    plural: 'Case Cards Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Section heading displayed above the cards',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'select',
                      defaultValue: 'cases',
                      options: [
                        { label: 'Cases', value: 'cases' },
                        { label: 'Reviews', value: 'reviews' },
                      ],
                      admin: {
                        description: 'Choose between case study cards or review/testimonial cards',
                      },
                    },
                    {
                      name: 'cases',
                      type: 'array',
                      admin: {
                        condition: (_, siblingData) =>
                          !siblingData?.displayMode || siblingData?.displayMode === 'cases',
                      },
                      validate: (value, { siblingData }) => {
                        const mode = (siblingData as Record<string, unknown>)?.displayMode
                        if (!mode || mode === 'cases') {
                          if (!value || (value as unknown[]).length === 0)
                            return 'At least one case is required'
                        }
                        return true
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                        {
                          name: 'sections',
                          type: 'array',
                          minRows: 1,
                          fields: [
                            {
                              name: 'emoji',
                              type: 'text',
                              admin: {
                                description:
                                  'Optional emoji icon (e.g. \uD83D\uDC64, \uD83C\uDFAF, \u26A0\uFE0F, \uD83D\uDE80, \uD83C\uDFC6, \uD83D\uDCB0)',
                              },
                            },
                            {
                              name: 'label',
                              type: 'text',
                              required: true,
                              localized: true,
                            },
                            {
                              name: 'content',
                              type: 'textarea',
                              required: true,
                              localized: true,
                              admin: {
                                description:
                                  'Plain text or bullet list (start lines with \u2022, -, \u00B7, or * for bullets)',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'reviews',
                      type: 'array',
                      admin: {
                        condition: (_, siblingData) => siblingData?.displayMode === 'reviews',
                      },
                      validate: (value, { siblingData }) => {
                        const mode = (siblingData as Record<string, unknown>)?.displayMode
                        if (mode === 'reviews') {
                          if (!value || (value as unknown[]).length === 0)
                            return 'At least one review is required'
                        }
                        return true
                      },
                      fields: [
                        {
                          name: 'quote',
                          type: 'textarea',
                          required: true,
                          localized: true,
                        },
                        {
                          name: 'authorName',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                        {
                          name: 'authorSubtitle',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'e.g. role, company, or confidentiality note',
                          },
                        },
                      ],
                    },
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          description: 'Search engine optimization and social media settings',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                // SEO Validation Score
                {
                  name: 'seoValidation',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/fields/SEOValidationField#SEOValidationField',
                    },
                  },
                },
                // Basic SEO
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'metaTitle',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'Override page title for search engines',
                        description:
                          'Optimal length: 50-60 characters. Leave empty to use page title.',
                      },
                      maxLength: 70,
                    },
                    {
                      name: 'focusKeyword',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'e.g., "web development"',
                        description: 'Main keyword this page should rank for',
                      },
                    },
                  ],
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                  admin: {
                    placeholder: 'Brief description for search results...',
                    description:
                      'Optimal length: 150-160 characters. This appears in search engine results.',
                  },
                  maxLength: 200,
                },
                {
                  name: 'keywords',
                  type: 'text',
                  localized: true,
                  admin: {
                    placeholder: 'keyword1, keyword2, keyword3',
                    description: 'Comma-separated keywords related to this page content',
                  },
                },

                // Advanced SEO Settings
                {
                  type: 'collapsible',
                  label: 'Advanced SEO Settings',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'canonicalUrl',
                      type: 'text',
                      admin: {
                        placeholder: 'https://example.com/canonical-page',
                        description:
                          'Specify a canonical URL to prevent duplicate content issues. Leave empty for default.',
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'noIndex',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            description: 'Prevent search engines from indexing this page',
                          },
                        },
                        {
                          name: 'noFollow',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            description: 'Prevent search engines from following links on this page',
                          },
                        },
                      ],
                    },
                  ],
                },

                // Open Graph (Facebook/LinkedIn)
                {
                  type: 'collapsible',
                  label: 'Open Graph / Facebook',
                  admin: {
                    description:
                      'How this page appears when shared on Facebook, LinkedIn, and other platforms',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'ogTitle',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'Override title for social media',
                        description: 'Falls back to Meta Title or Page Title if empty',
                      },
                    },
                    {
                      name: 'ogDescription',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        placeholder: 'Description for social media shares',
                        description: 'Falls back to Meta Description if empty',
                      },
                      maxLength: 300,
                    },
                    {
                      name: 'ogImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'Recommended: 1200x630px. Falls back to Meta Image if empty.',
                      },
                    },
                    {
                      name: 'ogType',
                      type: 'select',
                      defaultValue: 'website',
                      admin: {
                        description: 'Type of content',
                      },
                      options: [
                        { label: 'Website', value: 'website' },
                        { label: 'Article', value: 'article' },
                        { label: 'Blog', value: 'blog' },
                      ],
                    },
                  ],
                },

                // Twitter Card
                {
                  type: 'collapsible',
                  label: 'Twitter Card',
                  admin: {
                    description: 'How this page appears when shared on Twitter/X',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'twitterCard',
                      type: 'select',
                      defaultValue: 'summary_large_image',
                      admin: {
                        description: 'Card type to display on Twitter',
                      },
                      options: [
                        { label: 'Summary Card with Large Image', value: 'summary_large_image' },
                        { label: 'Summary Card', value: 'summary' },
                      ],
                    },
                    {
                      name: 'twitterTitle',
                      type: 'text',
                      localized: true,
                      admin: {
                        placeholder: 'Override title for Twitter',
                        description: 'Falls back to OG Title, Meta Title, or Page Title',
                      },
                    },
                    {
                      name: 'twitterDescription',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        placeholder: 'Description for Twitter shares',
                        description: 'Falls back to OG Description or Meta Description',
                      },
                      maxLength: 200,
                    },
                    {
                      name: 'twitterImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description:
                          'Recommended: 1200x675px (summary_large_image) or 400x400px (summary). Falls back to OG Image or Meta Image.',
                      },
                    },
                  ],
                },

                // General Meta Image (fallback for all)
                {
                  name: 'metaImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Default image for search results and social shares. Recommended: 1200x630px. Used when specific OG/Twitter images are not set.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // Additional metadata
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When this page was published (for news/blog pages)',
        condition: (data) => data.pageType === 'news',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'Author of this page',
        condition: (data) => data.pageType === 'news',
      },
    },
  ],
  timestamps: true,
}
