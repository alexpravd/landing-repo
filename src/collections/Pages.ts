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
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'Button link URL',
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
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'Button link URL',
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
                  slug: 'featuresBlock',
                  labels: {
                    singular: 'Features Block',
                    plural: 'Features Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the features grid',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid-3',
                      admin: {
                        description: 'Layout style for the features',
                      },
                      options: [
                        { label: '2 Column Grid', value: 'grid-2' },
                        { label: '3 Column Grid', value: 'grid-3' },
                        { label: '4 Column Grid', value: 'grid-4' },
                        { label: 'List', value: 'list' },
                      ],
                    },
                    {
                      name: 'cardStyle',
                      type: 'select',
                      required: true,
                      defaultValue: 'elevated',
                      admin: {
                        description: 'Visual style for the feature cards',
                      },
                      options: [
                        { label: 'Minimal', value: 'minimal' },
                        { label: 'Bordered', value: 'bordered' },
                        { label: 'Elevated (Shadow)', value: 'elevated' },
                        { label: 'Gradient', value: 'gradient' },
                      ],
                    },
                    {
                      name: 'items',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Feature/service items to display',
                      },
                      labels: {
                        singular: 'Feature Item',
                        plural: 'Feature Items',
                      },
                      fields: [
                        {
                          name: 'icon',
                          type: 'text',
                          admin: {
                            description: 'Icon for this feature',
                            components: {
                              Field: '@/fields/IconSelectField#IconSelectField',
                            },
                          },
                        },
                        {
                          name: 'title',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Feature title',
                          },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Feature description',
                          },
                        },
                        {
                          name: 'link',
                          type: 'group',
                          admin: {
                            description: 'Optional call-to-action link',
                          },
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Link text (e.g., "Learn More")',
                              },
                            },
                            {
                              name: 'url',
                              type: 'text',
                              admin: {
                                description: 'Link URL',
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
                    {
                      name: 'showCTAs',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Show call-to-action links on feature cards',
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
                  slug: 'testimonialsBlock',
                  labels: {
                    singular: 'Testimonials Block',
                    plural: 'Testimonials Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the testimonials',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'select',
                      required: true,
                      defaultValue: 'carousel',
                      admin: {
                        description: 'How to display the testimonials',
                      },
                      options: [
                        { label: 'Carousel', value: 'carousel' },
                        { label: 'Grid', value: 'grid' },
                        { label: 'Single Featured', value: 'single-featured' },
                      ],
                    },
                    {
                      name: 'testimonials',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Customer testimonials to display',
                      },
                      labels: {
                        singular: 'Testimonial',
                        plural: 'Testimonials',
                      },
                      fields: [
                        {
                          name: 'quote',
                          type: 'textarea',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'The testimonial quote text',
                          },
                        },
                        {
                          name: 'authorName',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Name of the person giving the testimonial',
                          },
                        },
                        {
                          name: 'authorRole',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Job title or role (e.g., "CEO", "Marketing Director")',
                          },
                        },
                        {
                          name: 'authorCompany',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Company or organization name',
                          },
                        },
                        {
                          name: 'authorPhoto',
                          type: 'upload',
                          relationTo: 'media',
                          admin: {
                            description: 'Photo of the person (recommended: square, min 100x100px)',
                          },
                        },
                        {
                          name: 'rating',
                          type: 'number',
                          min: 1,
                          max: 5,
                          admin: {
                            description: 'Star rating from 1 to 5 (optional)',
                            step: 0.5,
                          },
                        },
                        {
                          name: 'logo',
                          type: 'upload',
                          relationTo: 'media',
                          admin: {
                            description: 'Company logo (optional)',
                          },
                        },
                      ],
                    },
                    {
                      name: 'showRatings',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Display star ratings on testimonials',
                      },
                    },
                    {
                      name: 'autoplay',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description:
                          'Auto-rotate testimonials (for carousel and single-featured modes)',
                        condition: (_data, siblingData) =>
                          siblingData?.displayMode === 'carousel' ||
                          siblingData?.displayMode === 'single-featured',
                      },
                    },
                    {
                      name: 'autoplayInterval',
                      type: 'number',
                      defaultValue: 5000,
                      min: 2000,
                      max: 15000,
                      admin: {
                        description: 'Autoplay interval in milliseconds (2000-15000)',
                        condition: (_data, siblingData) =>
                          (siblingData?.displayMode === 'carousel' ||
                            siblingData?.displayMode === 'single-featured') &&
                          siblingData?.autoplay,
                      },
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'amber',
                      admin: {
                        description: 'Accent color for ratings, borders, and decorations',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'statsBlock',
                  labels: {
                    singular: 'Stats Block',
                    plural: 'Stats Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the stats',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid-4',
                      admin: {
                        description: 'Layout style for the stats',
                      },
                      options: [
                        { label: 'Row (horizontal)', value: 'row' },
                        { label: '2 Column Grid', value: 'grid-2' },
                        { label: '4 Column Grid', value: 'grid-4' },
                      ],
                    },
                    {
                      name: 'stats',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Statistics to display with animated counters',
                      },
                      labels: {
                        singular: 'Stat',
                        plural: 'Stats',
                      },
                      fields: [
                        {
                          name: 'value',
                          type: 'number',
                          required: true,
                          admin: {
                            description: 'The numeric value to display (will animate from 0)',
                          },
                        },
                        {
                          name: 'prefix',
                          type: 'text',
                          admin: {
                            description: 'Text before the number (e.g., "$", ">")',
                          },
                        },
                        {
                          name: 'suffix',
                          type: 'text',
                          admin: {
                            description: 'Text after the number (e.g., "+", "%", "K", "/7")',
                          },
                        },
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Description label below the number',
                          },
                        },
                        {
                          name: 'icon',
                          type: 'text',
                          admin: {
                            description: 'Optional icon above the stat',
                            components: {
                              Field: '@/fields/IconSelectField#IconSelectField',
                            },
                          },
                        },
                      ],
                    },
                    {
                      name: 'animateOnScroll',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Animate numbers when the block enters viewport',
                      },
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for numbers and decorations',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'timelineBlock',
                  labels: {
                    singular: 'Timeline Block',
                    plural: 'Timeline Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the timeline',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'vertical',
                      admin: {
                        description: 'Layout style for the timeline',
                      },
                      options: [
                        { label: 'Vertical (connector on left)', value: 'vertical' },
                        { label: 'Horizontal (scrollable)', value: 'horizontal' },
                        { label: 'Alternating (left/right)', value: 'alternating' },
                      ],
                    },
                    {
                      name: 'items',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Timeline items to display',
                      },
                      labels: {
                        singular: 'Timeline Item',
                        plural: 'Timeline Items',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Date or label (e.g., "2024", "Step 1", "Phase A")',
                          },
                        },
                        {
                          name: 'title',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Title for this timeline item',
                          },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Description text for this timeline item',
                          },
                        },
                        {
                          name: 'icon',
                          type: 'text',
                          admin: {
                            description: 'Optional icon for this timeline item',
                            components: {
                              Field: '@/fields/IconSelectField#IconSelectField',
                            },
                          },
                        },
                        {
                          name: 'status',
                          type: 'select',
                          defaultValue: 'upcoming',
                          admin: {
                            description: 'Status of this timeline item',
                          },
                          options: [
                            { label: 'Completed', value: 'completed' },
                            { label: 'Current', value: 'current' },
                            { label: 'Upcoming', value: 'upcoming' },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'showConnectors',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Show connector lines between timeline items',
                      },
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for the timeline',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'pricingBlock',
                  labels: {
                    singular: 'Pricing Block',
                    plural: 'Pricing Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the pricing plans',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'cards',
                      admin: {
                        description: 'Layout style for the pricing display',
                      },
                      options: [
                        { label: 'Cards (side-by-side)', value: 'cards' },
                        { label: 'Table (comparison table)', value: 'table' },
                        { label: 'Comparison (feature grid)', value: 'comparison' },
                      ],
                    },
                    {
                      name: 'billingToggle',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        description: 'Show monthly/yearly billing toggle (requires yearly prices)',
                      },
                    },
                    {
                      name: 'plans',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Pricing plans to display',
                      },
                      labels: {
                        singular: 'Plan',
                        plural: 'Plans',
                      },
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Plan name (e.g., "Basic", "Pro", "Enterprise")',
                          },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Short description of the plan',
                          },
                        },
                        {
                          name: 'monthlyPrice',
                          type: 'number',
                          admin: {
                            description: 'Monthly price (leave empty for "Contact Us")',
                          },
                        },
                        {
                          name: 'yearlyPrice',
                          type: 'number',
                          admin: {
                            description: 'Yearly price per month (for billing toggle)',
                            condition: (_data, siblingData) => siblingData?.monthlyPrice != null,
                          },
                        },
                        {
                          name: 'currency',
                          type: 'text',
                          defaultValue: '$',
                          admin: {
                            description: 'Currency symbol (e.g., "$", "€", "₴")',
                          },
                        },
                        {
                          name: 'billingPeriod',
                          type: 'text',
                          defaultValue: '/month',
                          localized: true,
                          admin: {
                            description: 'Billing period text (e.g., "/month", "/user/month")',
                          },
                        },
                        {
                          name: 'features',
                          type: 'array',
                          admin: {
                            description: 'Features included or excluded in this plan',
                          },
                          labels: {
                            singular: 'Feature',
                            plural: 'Features',
                          },
                          fields: [
                            {
                              name: 'text',
                              type: 'text',
                              required: true,
                              localized: true,
                              admin: {
                                description: 'Feature description',
                              },
                            },
                            {
                              name: 'included',
                              type: 'checkbox',
                              defaultValue: true,
                              admin: {
                                description: 'Is this feature included in the plan?',
                              },
                            },
                          ],
                        },
                        {
                          name: 'cta',
                          type: 'group',
                          admin: {
                            description: 'Call-to-action button for this plan',
                          },
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Button text (e.g., "Get Started", "Contact Sales")',
                              },
                            },
                            {
                              name: 'url',
                              type: 'text',
                              admin: {
                                description: 'Button link URL',
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
                            },
                          ],
                        },
                        {
                          name: 'highlighted',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            description: 'Feature this plan (special styling, slightly larger)',
                          },
                        },
                        {
                          name: 'badge',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Badge text (e.g., "Most Popular", "Best Value")',
                          },
                        },
                      ],
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for pricing elements',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'teamBlock',
                  labels: {
                    singular: 'Team Block',
                    plural: 'Team Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the team members',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid',
                      admin: {
                        description: 'Layout style for the team display',
                      },
                      options: [
                        { label: 'Grid (responsive grid of cards)', value: 'grid' },
                        { label: 'Carousel (horizontal with navigation)', value: 'carousel' },
                        { label: 'List (vertical with larger photos)', value: 'list' },
                      ],
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      defaultValue: '3',
                      admin: {
                        description: 'Number of columns in grid layout',
                        condition: (_data, siblingData) => siblingData?.layout === 'grid',
                      },
                      options: [
                        { label: '2 Columns', value: '2' },
                        { label: '3 Columns', value: '3' },
                        { label: '4 Columns', value: '4' },
                      ],
                    },
                    {
                      name: 'cardStyle',
                      type: 'select',
                      required: true,
                      defaultValue: 'card',
                      admin: {
                        description: 'Visual style for team member cards',
                      },
                      options: [
                        { label: 'Minimal (simple, no background)', value: 'minimal' },
                        { label: 'Card (elevated with shadow)', value: 'card' },
                        { label: 'Overlay (photo with gradient overlay)', value: 'overlay' },
                      ],
                    },
                    {
                      name: 'showSocialLinks',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Display social media links for team members',
                      },
                    },
                    {
                      name: 'members',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Team members to display',
                      },
                      labels: {
                        singular: 'Team Member',
                        plural: 'Team Members',
                      },
                      fields: [
                        {
                          name: 'photo',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                          admin: {
                            description: 'Team member photo (recommended: square aspect ratio)',
                          },
                        },
                        {
                          name: 'name',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Full name of the team member',
                          },
                        },
                        {
                          name: 'role',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Job title or position (e.g., "CEO", "Lead Designer")',
                          },
                        },
                        {
                          name: 'bio',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Short biography or description',
                          },
                        },
                        {
                          name: 'socialLinks',
                          type: 'array',
                          admin: {
                            description: 'Social media and contact links',
                          },
                          labels: {
                            singular: 'Social Link',
                            plural: 'Social Links',
                          },
                          fields: [
                            {
                              name: 'platform',
                              type: 'select',
                              required: true,
                              options: [
                                { label: 'LinkedIn', value: 'linkedin' },
                                { label: 'Twitter / X', value: 'twitter' },
                                { label: 'GitHub', value: 'github' },
                                { label: 'Email', value: 'email' },
                                { label: 'Website', value: 'website' },
                              ],
                            },
                            {
                              name: 'url',
                              type: 'text',
                              required: true,
                              admin: {
                                description:
                                  'Full URL or email address (for email, just enter the address)',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for team member elements',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'logoCloudBlock',
                  labels: {
                    singular: 'Logo Cloud Block',
                    plural: 'Logo Cloud Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title (e.g., "Trusted by", "Our Partners")',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      required: true,
                      defaultValue: 'grid',
                      admin: {
                        description: 'How to display the logos',
                      },
                      options: [
                        { label: 'Grid (static layout)', value: 'grid' },
                        { label: 'Carousel (auto-scrolling with dots)', value: 'carousel' },
                        { label: 'Marquee (infinite scroll)', value: 'marquee' },
                      ],
                    },
                    {
                      name: 'logos',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Partner/client logos to display',
                      },
                      labels: {
                        singular: 'Logo',
                        plural: 'Logos',
                      },
                      fields: [
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                          admin: {
                            description:
                              'Logo image (recommended: PNG with transparent background)',
                          },
                        },
                        {
                          name: 'name',
                          type: 'text',
                          admin: {
                            description: 'Company name (used for alt text)',
                          },
                        },
                        {
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'Optional link to partner website',
                          },
                        },
                      ],
                    },
                    {
                      name: 'grayscale',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Show logos in grayscale (color on hover)',
                      },
                    },
                    {
                      name: 'columns',
                      type: 'select',
                      defaultValue: '5',
                      admin: {
                        description: 'Number of columns for grid layout',
                        condition: (_data, siblingData) => siblingData?.layout === 'grid',
                      },
                      options: [
                        { label: '4 Columns', value: '4' },
                        { label: '5 Columns', value: '5' },
                        { label: '6 Columns', value: '6' },
                      ],
                    },
                    {
                      name: 'speed',
                      type: 'select',
                      defaultValue: 'normal',
                      admin: {
                        description: 'Animation speed for carousel/marquee',
                        condition: (_data, siblingData) =>
                          siblingData?.layout === 'carousel' || siblingData?.layout === 'marquee',
                      },
                      options: [
                        { label: 'Slow', value: 'slow' },
                        { label: 'Normal', value: 'normal' },
                        { label: 'Fast', value: 'fast' },
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
                  slug: 'videoBlock',
                  labels: {
                    singular: 'Video Block',
                    plural: 'Video Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'source',
                      type: 'select',
                      required: true,
                      defaultValue: 'youtube',
                      admin: {
                        description: 'Video source type',
                      },
                      options: [
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Vimeo', value: 'vimeo' },
                        { label: 'Custom URL (MP4/WebM)', value: 'custom' },
                        { label: 'Upload', value: 'upload' },
                      ],
                    },
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        description: 'Video URL (YouTube, Vimeo, or direct video URL)',
                        condition: (_data, siblingData) =>
                          siblingData?.source === 'youtube' ||
                          siblingData?.source === 'vimeo' ||
                          siblingData?.source === 'custom',
                      },
                    },
                    {
                      name: 'file',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'Upload a video file (MP4, WebM recommended)',
                        condition: (_data, siblingData) => siblingData?.source === 'upload',
                      },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional video title',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional video description',
                      },
                    },
                    {
                      name: 'thumbnail',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description:
                          'Custom thumbnail image (optional, defaults to video thumbnail for YouTube)',
                      },
                    },
                    {
                      name: 'autoplay',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        description: 'Auto-play video when visible (muted for YouTube/Vimeo)',
                      },
                    },
                    {
                      name: 'loop',
                      type: 'checkbox',
                      defaultValue: false,
                      admin: {
                        description: 'Loop video continuously',
                      },
                    },
                    {
                      name: 'controls',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Show video playback controls',
                      },
                    },
                    {
                      name: 'aspectRatio',
                      type: 'select',
                      defaultValue: '16:9',
                      admin: {
                        description: 'Video aspect ratio',
                      },
                      options: [
                        { label: '16:9 (Widescreen)', value: '16:9' },
                        { label: '4:3 (Standard)', value: '4:3' },
                        { label: '1:1 (Square)', value: '1:1' },
                        { label: '9:16 (Vertical/Mobile)', value: '9:16' },
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
                  slug: 'caseStudyBlock',
                  labels: {
                    singular: 'Case Study Block',
                    plural: 'Case Study Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the case studies',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'displayMode',
                      type: 'select',
                      required: true,
                      defaultValue: 'cards',
                      admin: {
                        description: 'How to display the case studies',
                      },
                      options: [
                        { label: 'Cards (grid layout)', value: 'cards' },
                        { label: 'Detailed (full-width sections)', value: 'detailed' },
                        { label: 'Carousel (horizontal slider)', value: 'carousel' },
                      ],
                    },
                    {
                      name: 'cases',
                      type: 'array',
                      required: true,
                      minRows: 1,
                      admin: {
                        description: 'Case studies to display',
                      },
                      labels: {
                        singular: 'Case Study',
                        plural: 'Case Studies',
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Case study title',
                          },
                        },
                        {
                          name: 'clientName',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Client or company name',
                          },
                        },
                        {
                          name: 'industry',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Industry or sector (e.g., "Technology", "Healthcare")',
                          },
                        },
                        {
                          name: 'challenge',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'The challenge or problem faced by the client',
                          },
                        },
                        {
                          name: 'solution',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'How you solved the challenge',
                          },
                        },
                        {
                          name: 'results',
                          type: 'array',
                          admin: {
                            description: 'Key results and metrics achieved',
                          },
                          labels: {
                            singular: 'Result',
                            plural: 'Results',
                          },
                          fields: [
                            {
                              name: 'metric',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Metric name (e.g., "Revenue Increase", "Time Saved")',
                              },
                            },
                            {
                              name: 'value',
                              type: 'text',
                              admin: {
                                description: 'Metric value (e.g., "150%", "$1M", "50 hours")',
                              },
                            },
                            {
                              name: 'description',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Optional additional context',
                              },
                            },
                          ],
                        },
                        {
                          name: 'testimonial',
                          type: 'group',
                          admin: {
                            description: 'Optional client testimonial quote',
                          },
                          fields: [
                            {
                              name: 'quote',
                              type: 'textarea',
                              localized: true,
                              admin: {
                                description: 'Testimonial quote text',
                              },
                            },
                            {
                              name: 'author',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Quote author name and title',
                              },
                            },
                          ],
                        },
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          admin: {
                            description: 'Main case study image or project screenshot',
                          },
                        },
                        {
                          name: 'logo',
                          type: 'upload',
                          relationTo: 'media',
                          admin: {
                            description: 'Client company logo',
                          },
                        },
                        {
                          name: 'link',
                          type: 'group',
                          admin: {
                            description: 'Optional link to full case study',
                          },
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Link text (e.g., "Read Full Story")',
                              },
                            },
                            {
                              name: 'url',
                              type: 'text',
                              admin: {
                                description: 'Link URL',
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
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for case study elements',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                  slug: 'comparisonBlock',
                  labels: {
                    singular: 'Comparison Block',
                    plural: 'Comparison Blocks',
                  },
                  fields: [
                    anchorIdField,
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Optional section title above the comparison',
                      },
                    },
                    {
                      name: 'subtitle',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        description: 'Optional section description',
                      },
                    },
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      defaultValue: 'before-after',
                      admin: {
                        description: 'Type of comparison display',
                      },
                      options: [
                        { label: 'Before/After Slider', value: 'before-after' },
                        { label: 'Feature Table', value: 'table' },
                        { label: 'Comparison Cards', value: 'cards' },
                      ],
                    },
                    // Before/After fields
                    {
                      name: 'beforeImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'The "before" image',
                        condition: (_data, siblingData) => siblingData?.type === 'before-after',
                      },
                    },
                    {
                      name: 'afterImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'The "after" image',
                        condition: (_data, siblingData) => siblingData?.type === 'before-after',
                      },
                    },
                    {
                      name: 'beforeLabel',
                      type: 'text',
                      defaultValue: 'Before',
                      localized: true,
                      admin: {
                        description: 'Label for the before image (e.g., "Before", "Old")',
                        condition: (_data, siblingData) => siblingData?.type === 'before-after',
                      },
                    },
                    {
                      name: 'afterLabel',
                      type: 'text',
                      defaultValue: 'After',
                      localized: true,
                      admin: {
                        description: 'Label for the after image (e.g., "After", "New")',
                        condition: (_data, siblingData) => siblingData?.type === 'before-after',
                      },
                    },
                    {
                      name: 'sliderDefault',
                      type: 'number',
                      defaultValue: 50,
                      min: 0,
                      max: 100,
                      admin: {
                        description: 'Default slider position (0-100%)',
                        condition: (_data, siblingData) => siblingData?.type === 'before-after',
                      },
                    },
                    // Table fields
                    {
                      name: 'headers',
                      type: 'array',
                      admin: {
                        description: 'Column headers for the comparison table',
                        condition: (_data, siblingData) => siblingData?.type === 'table',
                      },
                      labels: {
                        singular: 'Header',
                        plural: 'Headers',
                      },
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Header text (e.g., "Basic", "Pro", "Enterprise")',
                          },
                        },
                        {
                          name: 'highlighted',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            description: 'Highlight this column as recommended',
                          },
                        },
                      ],
                    },
                    {
                      name: 'rows',
                      type: 'array',
                      admin: {
                        description: 'Feature rows for the comparison table',
                        condition: (_data, siblingData) => siblingData?.type === 'table',
                      },
                      labels: {
                        singular: 'Row',
                        plural: 'Rows',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Feature name (e.g., "Storage", "Support")',
                          },
                        },
                        {
                          name: 'values',
                          type: 'array',
                          admin: {
                            description: 'Values for each column (should match number of headers)',
                          },
                          labels: {
                            singular: 'Value',
                            plural: 'Values',
                          },
                          fields: [
                            {
                              name: 'text',
                              type: 'text',
                              localized: true,
                              admin: {
                                description: 'Cell text (e.g., "10GB", "Unlimited")',
                              },
                            },
                            {
                              name: 'isCheckmark',
                              type: 'checkbox',
                              defaultValue: false,
                              admin: {
                                description: 'Display as checkmark instead of text',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'highlightColumn',
                      type: 'number',
                      defaultValue: 1,
                      min: 0,
                      admin: {
                        description: 'Column index to highlight (0-based)',
                        condition: (_data, siblingData) => siblingData?.type === 'table',
                      },
                    },
                    // Cards fields
                    {
                      name: 'items',
                      type: 'array',
                      admin: {
                        description: 'Comparison card items',
                        condition: (_data, siblingData) => siblingData?.type === 'cards',
                      },
                      labels: {
                        singular: 'Card',
                        plural: 'Cards',
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            description: 'Card title',
                          },
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          admin: {
                            description: 'Card description',
                          },
                        },
                        {
                          name: 'price',
                          type: 'text',
                          localized: true,
                          admin: {
                            description: 'Price or value (e.g., "$29/mo", "Free", "Contact Us")',
                          },
                        },
                        {
                          name: 'features',
                          type: 'array',
                          admin: {
                            description: 'Feature list for this card',
                          },
                          labels: {
                            singular: 'Feature',
                            plural: 'Features',
                          },
                          fields: [
                            {
                              name: 'text',
                              type: 'text',
                              required: true,
                              localized: true,
                              admin: {
                                description: 'Feature text',
                              },
                            },
                            {
                              name: 'included',
                              type: 'checkbox',
                              defaultValue: true,
                              admin: {
                                description: 'Is this feature included?',
                              },
                            },
                          ],
                        },
                        {
                          name: 'highlighted',
                          type: 'checkbox',
                          defaultValue: false,
                          admin: {
                            description: 'Highlight this card as recommended',
                          },
                        },
                        {
                          name: 'cta',
                          type: 'group',
                          admin: {
                            description: 'Call-to-action button',
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
                              name: 'url',
                              type: 'text',
                              admin: {
                                description: 'Button link URL',
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
                    // Common fields
                    {
                      name: 'accentColor',
                      type: 'select',
                      defaultValue: 'indigo',
                      admin: {
                        description: 'Accent color for comparison elements',
                      },
                      options: [
                        { label: 'Amber', value: 'amber' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Purple', value: 'purple' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
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
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'Button link URL',
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
                          name: 'url',
                          type: 'text',
                          admin: {
                            description: 'Button link URL',
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
                  slug: 'markdownText',
                  labels: {
                    singular: 'Markdown Rich Text Block',
                    plural: 'Markdown Rich Text Blocks',
                  },
                  fields: [
                    anchorIdField,
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
                    anchorIdField,
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
                    anchorIdField,
                    // Content fields
                    {
                      name: 'heading',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Main heading for the CTA block',
                      },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      admin: {
                        description: 'Supporting text below the heading',
                      },
                    },
                    {
                      name: 'icon',
                      type: 'text',
                      admin: {
                        description: 'Optional icon displayed before the heading',
                        components: {
                          Field: '@/fields/IconSelectField#IconSelectField',
                        },
                      },
                    },
                    // Primary button (original link field)
                    {
                      name: 'link',
                      type: 'group',
                      label: 'Primary Button',
                      admin: {
                        description: 'Main call-to-action button',
                      },
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
                    // Secondary button (new)
                    {
                      name: 'secondaryButton',
                      type: 'group',
                      label: 'Secondary Button',
                      admin: {
                        description: 'Optional secondary action button',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                        },
                        {
                          name: 'url',
                          type: 'text',
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
                        },
                      ],
                    },
                    // Layout options
                    {
                      name: 'alignment',
                      type: 'select',
                      defaultValue: 'centered',
                      admin: {
                        description: 'Content alignment',
                      },
                      options: [
                        { label: 'Centered', value: 'centered' },
                        { label: 'Left Aligned', value: 'left' },
                      ],
                    },
                    {
                      name: 'size',
                      type: 'select',
                      defaultValue: 'standard',
                      admin: {
                        description: 'Size variant affects padding and text sizes',
                      },
                      options: [
                        { label: 'Compact', value: 'compact' },
                        { label: 'Standard', value: 'standard' },
                        { label: 'Large', value: 'large' },
                      ],
                    },
                    // Background options
                    {
                      name: 'backgroundStyle',
                      type: 'select',
                      defaultValue: 'gradient',
                      admin: {
                        description: 'Background style for the CTA block',
                      },
                      options: [
                        { label: 'Gradient', value: 'gradient' },
                        { label: 'Solid Color', value: 'solid' },
                        { label: 'Transparent', value: 'transparent' },
                        { label: 'Image', value: 'image' },
                      ],
                    },
                    {
                      name: 'backgroundGradient',
                      type: 'text',
                      admin: {
                        description: 'Gradient preset for the background',
                        condition: (_data, siblingData) =>
                          siblingData?.backgroundStyle === 'gradient',
                        components: {
                          Field: '@/fields/GradientSelectField#GradientSelectField',
                        },
                      },
                    },
                    {
                      name: 'backgroundColor',
                      type: 'text',
                      admin: {
                        description: 'Background color (e.g., #4F46E5 or rgb(79, 70, 229))',
                        condition: (_data, siblingData) => siblingData?.backgroundStyle === 'solid',
                      },
                    },
                    {
                      name: 'backgroundImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: {
                        description: 'Background image for the CTA block',
                        condition: (_data, siblingData) => siblingData?.backgroundStyle === 'image',
                      },
                    },
                    {
                      name: 'backgroundOverlay',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Add a dark overlay on top of the background image',
                        condition: (_data, siblingData) => siblingData?.backgroundStyle === 'image',
                      },
                    },
                    {
                      name: 'backgroundOverlayOpacity',
                      type: 'number',
                      defaultValue: 50,
                      min: 0,
                      max: 100,
                      admin: {
                        description: 'Overlay opacity (0-100%)',
                        condition: (_data, siblingData) =>
                          siblingData?.backgroundStyle === 'image' &&
                          siblingData?.backgroundOverlay,
                      },
                    },
                    // Animation
                    {
                      name: 'enableAnimation',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Enable entrance animation',
                      },
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
                    anchorIdField,
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
                    anchorIdField,
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
                      name: 'variant',
                      type: 'select',
                      defaultValue: 'faq',
                      options: [
                        { label: 'FAQ Style', value: 'faq' },
                        { label: 'Steps', value: 'steps' },
                        { label: 'Features', value: 'features' },
                      ],
                      admin: {
                        description:
                          'Visual style: FAQ (clean Q&A), Steps (numbered progress), Features (with icons)',
                      },
                    },
                    {
                      name: 'showNumbers',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Show step numbers in the accordion headers',
                        condition: (_data, siblingData) => siblingData?.variant === 'steps',
                      },
                    },
                    {
                      name: 'iconStyle',
                      type: 'select',
                      defaultValue: 'chevron',
                      options: [
                        { label: 'Chevron', value: 'chevron' },
                        { label: 'Plus/Minus', value: 'plus' },
                        { label: 'Arrow', value: 'arrow' },
                      ],
                      admin: {
                        description: 'Style of expand/collapse icon',
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
                            // Rich text content (Markdown Rich Text)
                            {
                              name: 'richText',
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
                    anchorIdField,
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
                    anchorIdField,
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
                      name: 'ctaUrl',
                      type: 'text',
                      admin: {
                        description: 'Button link URL',
                      },
                    },
                    {
                      name: 'ctaOpenInNewTab',
                      type: 'checkbox',
                      defaultValue: false,
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
                      required: true,
                      minRows: 1,
                      admin: {
                        condition: (_, siblingData) =>
                          !siblingData?.displayMode || siblingData?.displayMode === 'cases',
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
                      minRows: 1,
                      admin: {
                        condition: (_, siblingData) => siblingData?.displayMode === 'reviews',
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
                {
                  slug: 'mediaBlock',
                  labels: {
                    singular: 'Media Gallery Block',
                    plural: 'Media Gallery Blocks',
                  },
                  fields: [
                    anchorIdField,
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
