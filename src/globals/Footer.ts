import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
  },
  admin: {
    livePreview: {
      url: ({ data: _data, locale }) => {
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
      name: 'title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Footer title displayed above the two-column layout',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact Info',
          fields: [
            {
              name: 'sectionTitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Main heading in the left column (e.g., "ЗАЛИШИТИ ЗАПИТ")',
              },
            },
            {
              name: 'sectionSubtitle',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Subtitle text below the heading',
              },
            },
            {
              name: 'messengerLinks',
              type: 'array',
              maxRows: 6,
              admin: {
                description: 'Messenger pill buttons (Telegram, Viber, WhatsApp, Signal)',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Telegram', value: 'telegram' },
                    { label: 'Viber', value: 'viber' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Signal', value: 'signal' },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'https://t.me/username',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phoneLabel',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Label above phone number (e.g., "Phone")',
                    width: '33%',
                  },
                },
                {
                  name: 'phoneNumber',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Display phone number',
                    width: '33%',
                  },
                },
                {
                  name: 'phoneHref',
                  type: 'text',
                  admin: {
                    description: 'Phone link (e.g., tel:+380123456789)',
                    width: '33%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'emailLabel',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Label above email (e.g., "Email")',
                    width: '33%',
                  },
                },
                {
                  name: 'emailAddress',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Display email address',
                    width: '33%',
                  },
                },
                {
                  name: 'emailHref',
                  type: 'text',
                  admin: {
                    description: 'Email link (e.g., mailto:info@example.com)',
                    width: '33%',
                  },
                },
              ],
            },
            {
              name: 'disclaimer',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Small disclaimer text at the bottom of the left column',
              },
            },
          ],
        },
        {
          label: 'Contact Form',
          fields: [
            {
              name: 'formHeading',
              type: 'text',
              localized: true,
              admin: {
                description: 'Heading above the form',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'formNamePlaceholder',
                  type: 'text',
                  localized: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'formPhonePlaceholder',
                  type: 'text',
                  localized: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'formEmailPlaceholder',
                  type: 'text',
                  localized: true,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'formOrganizationPlaceholder',
              type: 'text',
              localized: true,
            },
            {
              name: 'formMessagePlaceholder',
              type: 'text',
              localized: true,
            },
            {
              name: 'consentText',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Consent checkbox text',
              },
            },
            {
              name: 'submitButtonText',
              type: 'text',
              localized: true,
            },
            {
              name: 'successMessage',
              type: 'text',
              localized: true,
              admin: {
                description: 'Message shown after successful submission',
              },
            },
            {
              name: 'errorMessage',
              type: 'text',
              localized: true,
              admin: {
                description: 'Message shown on submission error',
              },
            },
            {
              name: 'sendAnotherButtonText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Text for "Send another" button after successful submission',
              },
            },
            {
              name: 'loadingText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Text shown while form is submitting (e.g., "Sending...")',
              },
            },
            {
              name: 'nameRequiredError',
              type: 'text',
              localized: true,
              admin: {
                description: 'Validation error for required name field',
              },
            },
            {
              name: 'emailRequiredError',
              type: 'text',
              localized: true,
              admin: {
                description: 'Validation error for invalid email',
              },
            },
            {
              name: 'consentRequiredError',
              type: 'text',
              localized: true,
              admin: {
                description: 'Validation error when consent checkbox is not checked',
              },
            },
          ],
        },
        {
          label: 'Bottom Bar',
          fields: [
            {
              name: 'copyrightText',
              type: 'text',
              localized: true,
              admin: {
                description: 'Copyright text displayed in the bottom bar',
              },
            },
          ],
        },
      ],
    },
  ],
}
