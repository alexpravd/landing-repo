# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Payload CMS platform built with Next.js 15, React 19, and Payload CMS 3.62. Features bilingual content support (Ukrainian/English/Spanish), block-based page architecture, and PostgreSQL database (Neon recommended for Vercel deployment).

## Common Commands

```bash
# Development (requires PostgreSQL - use Neon free tier)
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format           # Format with Prettier

# Payload CMS
npm run generate:types   # Regenerate payload-types.ts after schema changes

# Data Management
npm run create-admin     # Create admin user (admin@example.com)
npm run seed             # Seed demo bilingual content
npm run seed:fresh       # Cleanup + seed in one step
```

## Architecture

### Directory Structure

- `src/app/(app)/` - Public frontend routes with `[locale]` dynamic segments
- `src/app/(payload)/` - CMS admin panel (`/admin`) and API routes (`/api`)
- `src/collections/` - Payload CMS data models (Users, Media, Pages, News, Navigation, NewsTags, MediaFolders)
- `src/globals/` - Site-wide settings (SiteSettings, Footer)
- `src/components/` - React components including `ui/` (shadcn primitives) and block components
- `src/fields/` - Custom Payload admin fields (SEOValidationField, MarkdownEditorField, IconSelectField)
- `src/lib/` - Utilities: `payload.ts` (cached singleton), `utils.ts`, `seo.ts`, `transliterate.ts`
- `scripts/` - TypeScript utility scripts for admin/data management

### Key Patterns

**Block-based Pages**: Pages use composable blocks (Hero, News, CTA, Markdown, etc.) rendered via `RenderBlocks.tsx`

**Payload Singleton**: Always use `getPayload()` from `src/lib/payload.ts` - never initialize directly

**Server Components Default**: Pages are server components; use `'use client'` only when needed for interactivity

**Localization**: Content fields marked `localized: true` in collections; routes use `[locale]` segments; Cyrillic auto-transliterates to Latin for slugs

**Access Control**: Role-based (admin/user) at collection and field level; defined in collection access configurations

### Auto-generated Files

- `payload-types.ts` - TypeScript types from Payload schema (run `npm run generate:types` after schema changes)
- `src/app/(payload)/admin/importMap.js` - Admin panel imports

## Configuration

- **TypeScript**: Strict mode, path aliases (`@/*` → `./src/*`, `@/payload-types` → `./payload-types.ts`)
- **ESLint**: Next.js core-web-vitals rules; unused vars prefixed with `_` are ignored
- **Prettier**: No semicolons, single quotes, 100-char lines, Tailwind class sorting
- **Payload**: PostgreSQL (Neon), Slate editor, 3 locales (uk default, en, es), 5MB upload limit
- **Pre-commit**: Husky + lint-staged runs type-check, ESLint, and Prettier; commits blocked on failure

## Environment Variables

Required in `.env`:

- `DATABASE_URI` - PostgreSQL connection string (e.g., `postgresql://user:pass@host/db?sslmode=require`)
- `PAYLOAD_SECRET` - Min 32 characters
- `NEXT_PUBLIC_SERVER_URL` - Full URL (e.g., http://localhost:3000)

## Deployment

Optimized for Vercel + Neon (PostgreSQL) free tier deployment:
1. Create Neon account at https://neon.tech
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
