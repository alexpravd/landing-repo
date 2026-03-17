import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { env, getCorsOrigins } from './lib/env'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Navigation } from './collections/Navigation'
import { Pages } from './collections/Pages'
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
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],

  // Collections (data models)
  collections: [Users, Media, Navigation, Pages, ContactSubmissions],

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
    fallback: false,
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

  // Email configuration via Resend (enables password reset, email verification, etc.)
  ...(process.env.RESEND_API_KEY
    ? {
        email: resendAdapter({
          defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'noreply@yourdomain.com',
          defaultFromName: 'Payload Platform',
          apiKey: process.env.RESEND_API_KEY,
        }),
      }
    : {}),

  // Sharp for image processing (required for Vercel deployments)
  sharp,
})
