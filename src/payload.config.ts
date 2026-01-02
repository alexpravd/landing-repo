import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'
import { fileURLToPath } from 'url'

import { env, getCorsOrigins } from './lib/env'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MediaFolders } from './collections/MediaFolders'
import { Navigation } from './collections/Navigation'
import { Pages } from './collections/Pages'
import { News } from './collections/News'
import { NewsTags } from './collections/NewsTags'
import { SiteSettings } from './globals/SiteSettings'
import { Footer } from './globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Admin panel configuration
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Payload Platform',
    },
    // Disable admin in production if needed
    // disable: isProduction,
  },

  // Collections (data models)
  collections: [Users, Media, MediaFolders, Navigation, Pages, News, NewsTags],

  // Globals
  globals: [SiteSettings, Footer],

  // Rich text editor
  editor: slateEditor({}),

  // Secret for JWT encryption
  secret: env.PAYLOAD_SECRET,

  // TypeScript types generation
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },

  // Database adapter (PostgreSQL for Vercel/Neon deployment)
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
    },
  }),

  // Server URL
  serverURL: env.NEXT_PUBLIC_SERVER_URL,

  // CORS configuration
  cors: getCorsOrigins(),

  // CSRF protection
  csrf: getCorsOrigins(),

  // Localization configuration
  localization: {
    locales: [
      {
        label: 'Ukrainian',
        code: 'uk',
      },
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Spanish',
        code: 'es',
      },
    ],
    defaultLocale: 'uk',
    fallback: true,
  },

  // Upload configuration
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },

  // GraphQL configuration
  graphQL: {
    schemaOutputFile: path.resolve(dirname, '../schema.graphql'),
    disable: false,
  },

  // Email configuration (optional)
  // email: {
  //   transportOptions: {
  //     host: process.env.SMTP_HOST,
  //     port: 587,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASS,
  //     },
  //   },
  //   fromName: 'Payload Platform',
  //   fromAddress: 'noreply@payloadplatform.com',
  // },

  // Localization (if needed)
  // localization: {
  //   locales: ['en', 'es', 'fr'],
  //   defaultLocale: 'en',
  //   fallback: true,
  // },
})
