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
                  slug: 'sectionHeader',
                  labels: {
                    singular: 'Section Header',
                    plural: 'Section Headers',
                  },
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      defaultValue: 'small',
                      admin: {
                        description:
                          'Header style: Small (section headers) or Big (hero-style headers)',
                      },
                      options: [
                        {
                          label: 'Small - Section Header',
                          value: 'small',
                        },
                        {
                          label: 'Big - Hero Header',
                          value: 'big',
                        },
                      ],
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Main heading text (required)',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      admin: {
                        description: 'Secondary text below the title (optional)',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      admin: {
                        description: 'Additional description text (optional)',
                      },
                    },
                    {
                      name: 'headingLevel',
                      type: 'select',
                      defaultValue: 'h2',
                      admin: {
                        description: 'HTML heading level for SEO',
                      },
                      options: [
                        { label: 'H1', value: 'h1' },
                        { label: 'H2', value: 'h2' },
                        { label: 'H3', value: 'h3' },
                        { label: 'H4', value: 'h4' },
                        { label: 'H5', value: 'h5' },
                        { label: 'H6', value: 'h6' },
                      ],
                    },
                    {
                      name: 'badge',
                      type: 'group',
                      admin: {
                        description: 'Optional badge displayed above the title',
                      },
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          admin: {
                            description: 'Badge text (e.g., "Featured Content")',
                          },
                        },
                        {
                          name: 'icon',
                          type: 'text',
                          admin: {
                            description: 'Icon displayed in the badge',
                            components: {
                              Field: '@/fields/IconSelectField#IconSelectField',
                            },
                          },
                        },
                        {
                          name: 'gradient',
                          type: 'text',
                          admin: {
                            description: 'Gradient color scheme for the badge',
                            components: {
                              Field: '@/fields/GradientSelectField#GradientSelectField',
                            },
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
                  slug: 'richText',
                  labels: {
                    singular: 'Rich Text Block',
                    plural: 'Rich Text Blocks',
                  },
                  fields: [
                    {
                      name: 'content',
                      type: 'richText',
                      required: true,
                    },
                  ],
                },
                {
                  slug: 'markdownText',
                  labels: {
                    singular: 'Markdown Rich Text Block',
                    plural: 'Markdown Rich Text Blocks',
                  },
                  fields: [
                    {
                      name: 'markdown',
                      type: 'textarea',
                      required: true,
                      admin: {
                        description:
                          'Use the visual markdown editor below. Live preview is shown on the right side.',
                        components: {
                          Field: '@/fields/MarkdownEditorField#MarkdownEditorField',
                        },
                      },
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'amber',
                      admin: {
                        description: 'Color scheme for blockquotes and accents',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'imageBlock',
                  labels: {
                    singular: 'Image Block',
                    plural: 'Image Blocks',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                  ],
                },
                {
                  slug: 'callToAction',
                  labels: {
                    singular: 'Call to Action',
                    plural: 'Call to Actions',
                  },
                  fields: [
                    {
                      name: 'heading',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                    },
                    {
                      name: 'link',
                      type: 'group',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'url',
                          type: 'text',
                          required: true,
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
                {
                  slug: 'newsBlock',
                  labels: {
                    singular: 'News Block',
                    plural: 'News Blocks',
                  },
                  fields: [
                    {
                      name: 'displayMode',
                      type: 'select',
                      required: true,
                      defaultValue: 'list',
                      admin: {
                        description: 'How to display news items',
                      },
                      options: [
                        { label: 'List Mode (with search & filters)', value: 'list' },
                        { label: 'Carousel Mode', value: 'carousel' },
                        { label: 'Grid Mode (split layout)', value: 'grid' },
                      ],
                    },
                    {
                      name: 'contentSource',
                      type: 'select',
                      required: true,
                      defaultValue: 'all',
                      admin: {
                        description: 'Which news items to display',
                      },
                      options: [
                        { label: 'All News (latest first)', value: 'all' },
                        { label: 'Filter by Tag', value: 'byTag' },
                        { label: 'Manual Selection', value: 'manual' },
                      ],
                    },
                    {
                      name: 'selectedTag',
                      type: 'relationship',
                      relationTo: 'news-tags',
                      admin: {
                        description: 'Show only news with this tag',
                        condition: (_data, siblingData) => siblingData?.contentSource === 'byTag',
                      },
                    },
                    {
                      name: 'selectedNews',
                      type: 'relationship',
                      relationTo: 'news',
                      hasMany: true,
                      admin: {
                        description: 'Manually select specific news articles',
                        condition: (_data, siblingData) => siblingData?.contentSource === 'manual',
                      },
                    },
                    {
                      name: 'limit',
                      type: 'number',
                      defaultValue: 10,
                      admin: {
                        description: 'Maximum number of items to show (for all/byTag modes)',
                        condition: (_data, siblingData) => siblingData?.contentSource !== 'manual',
                      },
                    },
                    // List Mode Options
                    {
                      type: 'row',
                      admin: {
                        condition: (_data, siblingData) => siblingData?.displayMode === 'list',
                      },
                      fields: [
                        {
                          name: 'enableSearch',
                          type: 'checkbox',
                          defaultValue: true,
                          admin: {
                            description: 'Show search bar',
                          },
                        },
                        {
                          name: 'enableFilters',
                          type: 'checkbox',
                          defaultValue: true,
                          admin: {
                            description: 'Show tag filters',
                          },
                        },
                        {
                          name: 'enablePagination',
                          type: 'checkbox',
                          defaultValue: true,
                          admin: {
                            description: 'Enable pagination',
                          },
                        },
                      ],
                    },
                    {
                      name: 'itemsPerPage',
                      type: 'number',
                      defaultValue: 9,
                      admin: {
                        description: 'Items per page (List mode only)',
                        condition: (_data, siblingData) =>
                          siblingData?.displayMode === 'list' && siblingData?.enablePagination,
                      },
                    },
                  ],
                },
                {
                  slug: 'accordionBlock',
                  dbName: 'acc_blk',
                  labels: {
                    singular: 'Accordion Block',
                    plural: 'Accordion Blocks',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the accordion',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional description text',
                      },
                    },
                    {
                      name: 'allowMultiple',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        description: 'Allow multiple accordion items to be open at once',
                      },
                    },
                    {
                      name: 'accordionItems',
                      type: 'array',
                      dbName: 'acc_items',
                      required: true,
                      minRows: 1,
                      labels: {
                        singular: 'Accordion Item',
                        plural: 'Accordion Items',
                      },
                      fields: [
                        {
                          name: 'itemTitle',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Title shown in accordion header (clickable)',
                          },
                        },
                        {
                          name: 'contentItems',
                          type: 'array',
                          dbName: 'cnt_items',
                          required: true,
                          minRows: 1,
                          labels: {
                            singular: 'Content Item',
                            plural: 'Content Items',
                          },
                          fields: [
                            {
                              name: 'contentType',
                              type: 'select',
                              dbName: 'cnt_type',
                              required: true,
                              defaultValue: 'text',
                              options: [
                                { label: 'Text', value: 'text' },
                                { label: 'Rich Text', value: 'richText' },
                                { label: 'Image', value: 'image' },
                                { label: 'Link List', value: 'linkList' },
                              ],
                            },
                            // Text content
                            {
                              name: 'text',
                              type: 'textarea',
                              localized: true,
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.contentType === 'text',
                              },
                            },
                            // Rich text content
                            {
                              name: 'richText',
                              type: 'richText',
                              localized: true,
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.contentType === 'richText',
                              },
                            },
                            // Image content
                            {
                              name: 'image',
                              type: 'upload',
                              relationTo: 'media',
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.contentType === 'image',
                              },
                            },
                            {
                              name: 'imageCaption',
                              type: 'text',
                              localized: true,
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.contentType === 'image',
                              },
                            },
                            // Link list content
                            {
                              name: 'links',
                              type: 'array',
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.contentType === 'linkList',
                              },
                              fields: [
                                {
                                  name: 'linkText',
                                  type: 'text',
                                  required: true,
                                  localized: true,
                                },
                                {
                                  name: 'linkUrl',
                                  type: 'text',
                                  required: true,
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
                    },
                  ],
                },
                {
                  slug: 'personPlaceBlock',
                  labels: {
                    singular: 'Person/Place Block',
                    plural: 'Person/Place Blocks',
                  },
                  fields: [
                    {
                      name: 'displayMode',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid',
                      options: [
                        { label: 'Grid Mode', value: 'grid' },
                        { label: 'Full Row Mode', value: 'fullRow' },
                      ],
                    },
                    {
                      name: 'itemsPerRow',
                      type: 'select',
                      defaultValue: '3',
                      admin: {
                        condition: (_data, siblingData) => siblingData?.displayMode === 'grid',
                      },
                      options: [
                        { label: '3 Items per Row', value: '3' },
                        { label: '4 Items per Row', value: '4' },
                      ],
                    },
                    {
                      name: 'items',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      fields: [
                        {
                          name: 'photo',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                        },
                        {
                          name: 'name',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                        {
                          name: 'subtitle',
                          type: 'text',
                          localized: true,
                          admin: { description: 'Role, position, or short description' },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description:
                              'Detailed description (shown in both grid and full row modes)',
                          },
                        },
                        {
                          name: 'customFields',
                          type: 'array',
                          admin: {
                            condition: (_data, _siblingData, { blockData }) =>
                              blockData?.displayMode === 'fullRow',
                          },
                          fields: [
                            { name: 'label', type: 'text', required: true, localized: true },
                            { name: 'value', type: 'text', required: true, localized: true },
                          ],
                        },
                        {
                          name: 'readMoreLink',
                          type: 'group',
                          fields: [
                            { name: 'enabled', type: 'checkbox', defaultValue: false },
                            {
                              name: 'url',
                              type: 'text',
                              admin: { condition: (_data, siblingData) => siblingData?.enabled },
                            },
                            {
                              name: 'openInNewTab',
                              type: 'checkbox',
                              defaultValue: false,
                              admin: { condition: (_data, siblingData) => siblingData?.enabled },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'tabBlock',
                  dbName: 'tab_blk',
                  labels: {
                    singular: 'Tab Block',
                    plural: 'Tab Blocks',
                  },
                  fields: [
                    {
                      name: 'tabs',
                      type: 'array',
                      dbName: 'tb_tabs',
                      required: true,
                      minRows: 1,
                      fields: [
                        {
                          name: 'tabName',
                          type: 'text',
                          required: true,
                          localized: true,
                        },
                        {
                          name: 'contentType',
                          type: 'select',
                          required: true,
                          defaultValue: 'richText',
                          options: [
                            { label: 'Rich Text', value: 'richText' },
                            { label: 'News', value: 'news' },
                            { label: 'Images', value: 'images' },
                            { label: 'Records', value: 'records' },
                          ],
                        },
                        // Rich Text content (using Smart Markdown Editor)
                        {
                          name: 'richTextContent',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Use the Smart Markdown Editor to format your content',
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'richText',
                            components: {
                              Field: '@/fields/MarkdownEditorField#MarkdownEditorField',
                            },
                          },
                        },
                        // News content
                        {
                          name: 'newsSource',
                          type: 'select',
                          defaultValue: 'latest',
                          admin: {
                            condition: (_data, siblingData) => siblingData?.contentType === 'news',
                          },
                          options: [
                            { label: 'Latest News', value: 'latest' },
                            { label: 'By Tag', value: 'byTag' },
                            { label: 'Manual Selection', value: 'manual' },
                          ],
                        },
                        {
                          name: 'newsTag',
                          type: 'relationship',
                          relationTo: 'news-tags',
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'news' &&
                              siblingData?.newsSource === 'byTag',
                          },
                        },
                        {
                          name: 'selectedNews',
                          type: 'relationship',
                          relationTo: 'news',
                          hasMany: true,
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'news' &&
                              siblingData?.newsSource === 'manual',
                          },
                        },
                        {
                          name: 'newsLimit',
                          type: 'number',
                          defaultValue: 6,
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'news' &&
                              siblingData?.newsSource !== 'manual',
                          },
                        },
                        // Images content
                        {
                          name: 'images',
                          type: 'array',
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'images',
                          },
                          fields: [
                            {
                              name: 'image',
                              type: 'upload',
                              relationTo: 'media',
                              required: true,
                            },
                            {
                              name: 'caption',
                              type: 'text',
                              localized: true,
                            },
                          ],
                        },
                        // Records content (flexible items)
                        {
                          name: 'records',
                          type: 'array',
                          dbName: 'tb_recs',
                          admin: {
                            condition: (_data, siblingData) =>
                              siblingData?.contentType === 'records',
                          },
                          fields: [
                            {
                              name: 'recordType',
                              type: 'select',
                              required: true,
                              defaultValue: 'richText',
                              options: [
                                { label: 'Rich Text', value: 'richText' },
                                { label: 'Image', value: 'image' },
                                { label: 'Video', value: 'video' },
                                { label: 'Image Card', value: 'imageCard' },
                              ],
                            },
                            // Rich text record (using Smart Markdown Editor)
                            {
                              name: 'recordRichText',
                              type: 'textarea',
                              localized: true,
                              admin: {
                                description: 'Use the Smart Markdown Editor to format your content',
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'richText',
                                components: {
                                  Field: '@/fields/MarkdownEditorField#MarkdownEditorField',
                                },
                              },
                            },
                            // Image record
                            {
                              name: 'recordImage',
                              type: 'upload',
                              relationTo: 'media',
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'image',
                              },
                            },
                            // Video record
                            {
                              name: 'videoUrl',
                              type: 'text',
                              admin: {
                                description: 'YouTube, Vimeo, or other video platform URL',
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'video',
                              },
                            },
                            // Image Card record (image with title, desc, link)
                            {
                              name: 'cardImage',
                              type: 'upload',
                              relationTo: 'media',
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'imageCard',
                              },
                            },
                            {
                              name: 'cardTitle',
                              type: 'text',
                              localized: true,
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'imageCard',
                              },
                            },
                            {
                              name: 'cardDescription',
                              type: 'textarea',
                              localized: true,
                              admin: {
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'imageCard',
                              },
                            },
                            {
                              name: 'cardLink',
                              type: 'text',
                              admin: {
                                description: 'Internal route (/page) or external URL (https://...)',
                                condition: (_data, siblingData) =>
                                  siblingData?.recordType === 'imageCard',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'mediaBlock',
                  labels: {
                    singular: 'Media Gallery Block',
                    plural: 'Media Gallery Blocks',
                  },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional title for the gallery section',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid',
                      options: [
                        { label: 'Grid', value: 'grid' },
                        { label: 'Masonry', value: 'masonry' },
                        { label: 'Carousel', value: 'carousel' },
                      ],
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      defaultValue: '3',
                      admin: {
                        condition: (_data, siblingData) => siblingData?.displayMode !== 'carousel',
                      },
                      options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                      ],
                    },
                    {
                      name: 'media',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      fields: [
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                        },
                        {
                          name: 'caption',
                          type: 'text',
                          localized: true,
                        },
                      ],
                    },
                    {
                      name: 'enableLightbox',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Allow clicking images to view full size',
                      },
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
