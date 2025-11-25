import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack (stable in Next.js 16)
  // Use --turbopack flag in dev script instead

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // React strict mode for better development
  reactStrictMode: true,

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Experimental features
  experimental: {
    // Optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // TypeScript
  typescript: {
    // Set to true to allow production builds even if there are type errors
    // Not recommended, but useful for quick deployments
    ignoreBuildErrors: true,
  },

  // ESLint
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src'],
    ignoreDuringBuilds: true,
  },

  // Webpack configuration for Monaco Editor
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        perf_hooks: false,
      }
    }
    return config
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects (if needed)
  async redirects() {
    return []
  },

  // Rewrites (if needed)
  async rewrites() {
    return []
  },
}

// Wrap Next.js config with Payload
export default withPayload(nextConfig)
