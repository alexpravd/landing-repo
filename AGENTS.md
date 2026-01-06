# AGENTS.md

Agent guidance for this Payload CMS + Next.js codebase. See CLAUDE.md for project overview.

## Commands

### Development

```bash
npm run dev              # Start dev server (port 3000, requires PostgreSQL)
npm run build            # Production build (8GB memory allocation)
npm run start            # Start production server
```

### Code Quality

```bash
npm run type-check       # TypeScript type checking (runs on full project)
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint errors
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without modifying
```

### Payload CMS

```bash
npm run generate:types   # Regenerate payload-types.ts after schema changes
npm run generate:importmap # Regenerate admin import map
```

### Data Management

```bash
npm run create-admin     # Create admin user (admin@example.com)
npm run seed             # Seed demo bilingual content
npm run seed:fresh       # Cleanup database + seed in one step
```

### Testing

No test framework is configured. Validate changes with:

1. `npm run type-check`
2. `npm run lint`
3. `npm run build`

### Pre-commit (automatic)

Husky runs on every commit:

1. TypeScript type-check (full project, blocks on error)
2. ESLint on staged files (blocks on error)
3. Prettier on staged files (auto-formats)

## Code Style

### Formatting (Prettier)

- No semicolons
- Single quotes (double quotes in JSX attributes)
- 100 character line width
- 2-space indentation
- Trailing commas: es5
- LF line endings
- Tailwind classes auto-sorted (prettier-plugin-tailwindcss)

### TypeScript

Strict mode with all checks enabled:

- strictNullChecks, noImplicitAny, noUnusedLocals, noUnusedParameters
- noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch

Rules:

- Prefix unused variables/parameters with underscore: `_unusedVar`
- Use `import type { X }` for type-only imports
- Avoid `any` (warning); use proper types or `unknown`
- Avoid non-null assertions `!` (warning)

### Path Aliases (required)

Use path aliases instead of relative imports from src/:

| Alias             | Path                  |
| ----------------- | --------------------- |
| `@/*`             | `./src/*`             |
| `@/components/*`  | `./src/components/*`  |
| `@/lib/*`         | `./src/lib/*`         |
| `@/collections/*` | `./src/collections/*` |
| `@/payload-types` | `./payload-types.ts`  |

### Auto-generated Files (never edit)

- `payload-types.ts` - Run `npm run generate:types` to regenerate
- `src/app/(payload)/admin/importMap.js` - Auto-generated

### Import Order

1. External packages (react, next, payload)
2. Path alias imports (@/lib/_, @/components/_)
3. Relative imports (./Component, ../utils)
4. Type imports last within each group

```typescript
import { useState } from 'react'
import type { CollectionConfig } from 'payload'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { IconName } from '@/lib/icons'

import { LocalComponent } from './LocalComponent'
```

### Naming Conventions

| Element          | Convention                | Example                                |
| ---------------- | ------------------------- | -------------------------------------- |
| Components       | PascalCase                | `SectionHeaderBlock`                   |
| Collections      | PascalCase                | `export const Pages: CollectionConfig` |
| Types/Interfaces | PascalCase                | `interface RenderBlocksProps`          |
| Props interfaces | PascalCase + Props suffix | `ComponentNameProps`                   |
| Functions        | camelCase                 | `formatDate`, `getPayload`             |
| Variables        | camelCase                 | `cachedPayload`, `baseUrl`             |
| Collection slugs | kebab-case                | `slug: 'news-tags'`                    |
| Field names      | camelCase                 | `pageType`, `metaTitle`                |

### React Patterns

Server Components (default - no directive needed):

```typescript
import type { PayloadType } from '@/payload-types'

interface ComponentProps {
  data: PayloadType
}

export function Component({ data }: ComponentProps) {
  // Server component by default
}
```

Client Components (only when hooks/interactivity needed):

```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState(false)
}
```

Early returns for empty states:

```typescript
if (!blocks || blocks.length === 0) {
  return null
}
```

### Payload CMS Patterns

Always use the singleton from `src/lib/payload.ts`:

```typescript
import { getPayload } from '@/lib/payload'

const payload = await getPayload()
```

Access control pattern:

```typescript
access: {
  read: ({ req: { user } }) => {
    if (!user) return { status: { equals: 'published' } }
    return true
  },
  create: ({ req: { user } }) => !!user,
  update: ({ req: { user } }) => !!user,
  delete: ({ req: { user } }) => user?.role === 'admin',
}
```

Block rendering pattern:

```typescript
switch (block.blockType) {
  case 'sectionHeader':
    return <SectionHeaderBlock key={key} {...props} />
  default:
    console.warn(`Unknown block type: ${block.blockType}`)
    return null
}
```

Custom admin field reference:

```typescript
admin: {
  components: {
    Field: '@/fields/FieldName#FieldName',
  },
}
```

### Localization

- Content fields use `localized: true`
- Routes use `[locale]` segments
- Default locale: `uk`, others: `en`, `es`
- Cyrillic auto-transliterates to Latin for slugs

### Error Handling

- Validate only at system boundaries (user input, external APIs)
- Use `console.warn` for non-fatal issues (unknown block types)
- Return `true` or error string from Payload validators
- Trust internal code and framework guarantees

## Pre-commit Checklist

Before committing, ensure:

1. `npm run type-check` passes
2. `npm run lint` shows no errors
3. `npm run format:check` passes (or run `npm run format`)

After modifying collections/globals:

- Run `npm run generate:types` to update payload-types.ts
