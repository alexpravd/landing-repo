/**
 * Environment Configuration & Validation
 * Validates required environment variables on application startup
 */

interface EnvironmentConfig {
  DATABASE_URI: string
  PAYLOAD_SECRET: string
  NEXT_PUBLIC_SERVER_URL: string
  NODE_ENV: 'development' | 'production' | 'test'
  CORS_ORIGINS?: string
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

/**
 * Validates and returns typed environment configuration
 * @throws {EnvironmentError} If required variables are missing or invalid
 */
function validateEnvironment(): EnvironmentConfig {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  const required = ['DATABASE_URI', 'PAYLOAD_SECRET', 'NEXT_PUBLIC_SERVER_URL'] as const

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\n` +
        'Please check your .env file and ensure all required variables are set.'
    )
  }

  // Validate DATABASE_URI format (PostgreSQL)
  const dbUri = process.env.DATABASE_URI as string
  if (!dbUri.startsWith('postgres://') && !dbUri.startsWith('postgresql://')) {
    throw new EnvironmentError(
      'DATABASE_URI must be a valid PostgreSQL connection string (postgres:// or postgresql://)'
    )
  }

  // Validate PAYLOAD_SECRET strength
  const secret = process.env.PAYLOAD_SECRET as string
  if (secret.length < 32) {
    warnings.push(
      'PAYLOAD_SECRET should be at least 32 characters long for security. ' +
        'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }

  // Validate SERVER_URL format
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL as string
  try {
    new URL(serverUrl)
  } catch {
    throw new EnvironmentError('NEXT_PUBLIC_SERVER_URL must be a valid URL')
  }

  // Log warnings
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('\n⚠️  Environment Warnings:')
    warnings.forEach((warning) => console.warn(`   ${warning}`))
    console.warn('')
  }

  return {
    DATABASE_URI: dbUri,
    PAYLOAD_SECRET: secret,
    NEXT_PUBLIC_SERVER_URL: serverUrl,
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    CORS_ORIGINS: process.env.CORS_ORIGINS,
  }
}

/**
 * Validated environment configuration
 * Throws on application startup if invalid
 */
export const env = validateEnvironment()

/**
 * Get CORS origins from environment or defaults
 */
export function getCorsOrigins(): string[] {
  if (env.CORS_ORIGINS) {
    return env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  }

  // Development defaults
  if (env.NODE_ENV === 'development') {
    return ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173']
  }

  // Production requires explicit CORS_ORIGINS
  return []
}

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test'
