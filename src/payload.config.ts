import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'

import { env, getCorsOrigins } from './lib/env'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Navigation } from './collections/Navigation'
import { Pages } from './collections/Pages'
import { News } from './collections/News'
import { NewsTags } from './collections/NewsTags'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { SiteSettings } from './globals/SiteSettings'
import { Footer } from './globals/Footer'
import { MediaFoldersGlobal } from './globals/MediaFolders'

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

  // Plugins
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  // Collections (data models)
  collections: [Users, Media, Navigation, Pages, News, NewsTags, ContactSubmissions],

  // Globals
  globals: [SiteSettings, Footer, MediaFoldersGlobal],

  // Rich text editor
  editor: slateEditor({}),

  // Secret for JWT encryption
  secret: env.PAYLOAD_SECRET,

  // TypeScript types generation
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },

  // Database adapter (PostgreSQL for Vercel/Neon deployment)
  // Connection pooling configured for Neon free tier limits
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
      max: 10, // Neon free tier connection limit
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 10000, // Connection timeout 10s
    },
    push: true, // Force schema sync on startup (creates missing version tables)
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
