# Payload Platform

Modern content management platform built with Next.js 15, React 19, and Payload CMS 3.62. Features bilingual content (Ukrainian/English/Spanish), block-based pages, and MongoDB database.

## Tech Stack

- **Next.js 15** - App Router, Server Components
- **Payload CMS 3.62** - Headless CMS with admin panel
- **MongoDB** - Database with Mongoose ORM
- **TypeScript** - Strict mode enabled
- **Tailwind CSS** + **shadcn/ui** - Styling and components

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (for local development)

## Quick Start (Docker)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env and set PAYLOAD_SECRET (min 32 chars)

# 3. Start everything (MongoDB + seed + dev server)
npm run dev:docker
```

First run automatically:

- Starts MongoDB in Docker
- Creates admin user (admin@example.com / admin123)
- Seeds bilingual demo content
- Launches Next.js dev server

Access points:

- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- REST API: http://localhost:3000/api
- GraphQL: http://localhost:3000/api/graphql

## Scripts

| Command                  | Description                                 |
| ------------------------ | ------------------------------------------- |
| `npm run dev:docker`     | Start MongoDB + auto-seed + dev server      |
| `npm run dev`            | Dev server only (requires external MongoDB) |
| `npm run build`          | Production build                            |
| `npm run docker:down`    | Stop MongoDB (keeps data)                   |
| `npm run docker:clean`   | Stop MongoDB + delete all data              |
| `npm run seed:fresh`     | Reset and re-seed database                  |
| `npm run generate:types` | Regenerate TypeScript types                 |
| `npm run lint`           | Run ESLint                                  |
| `npm run type-check`     | TypeScript checking                         |

## Pre-commit Hooks

This project uses Husky + lint-staged for automatic code quality checks before commits:

- **TypeScript** - Full project type-check
- **ESLint** - Auto-fix on staged files (blocks on errors/warnings)
- **Prettier** - Auto-format staged files

Commits are blocked if any check fails. Hooks are installed automatically via `npm install`.

## Environment Variables

Required in `.env`:

```env
DATABASE_URI=mongodb://localhost:27017/payload-platform
PAYLOAD_SECRET=your-secret-key-min-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Project Structure

```
src/
├── app/(app)/          # Frontend routes with [locale] segments
├── app/(payload)/      # Admin panel and API routes
├── collections/        # Payload data models (Users, Media, Pages, News, etc.)
├── globals/            # Site-wide settings
├── components/         # React components (ui/, blocks, etc.)
├── fields/             # Custom Payload admin fields
└── lib/                # Utilities (payload.ts, utils.ts, seo.ts)
```

## Collections

- **Users** - Authentication with role-based access (admin/user)
- **Media** - File uploads with auto-resizing
- **Pages** - Block-based dynamic pages
- **News** - Articles with drafts, versioning, tags
- **Navigation** - Multi-level site navigation
- **NewsTags** - Color-coded categorization

## Deployment

**Build:** `npm run build`
**Start:** `npm run start`

Works with Vercel, Railway, Render, or any Node.js platform.

Required env vars: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `NODE_ENV=production`

## Documentation

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
