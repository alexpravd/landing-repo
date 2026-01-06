# Payload Platform Design Principles & Guidelines

Version: 1.0 | Last Updated: January 2025
Target Audience: Frontend engineers, content editors, designers
Tech Stack: Next.js 15, React 19, Payload CMS 3.62, TypeScript, Tailwind CSS, shadcn/ui

## Document Overview

This document establishes design principles, patterns, and implementation guidelines for the Payload Platform. It ensures visual consistency, accessibility compliance, and maintainability across the trilingual content management system serving Ukrainian, English, and Spanish audiences.

---

## Table of Contents

1. [Core Design Principles](#i-core-design-principles)
2. [Color System](#ii-color-system)
3. [Typography](#iii-typography)
4. [Spacing & Layout](#iv-spacing--layout)
5. [Component Design Patterns](#v-component-design-patterns)
6. [Accessibility Standards](#vi-accessibility-standards)
7. [Responsive Design](#vii-responsive-design)
8. [Motion & Animation](#viii-motion--animation)
9. [Localization Design](#ix-localization-design)
10. [Implementation Checklist](#x-implementation-checklist)

---

## I. Core Design Principles

Seven foundational principles guiding all design decisions for the Payload Platform.

### A. Content-First Hierarchy

[ ] **Principle 1: Content Primacy**
Content is the primary interface element. All UI chrome serves to present and navigate content, never to compete with it.

    Implementation:
    - Maximum content width: 768px for long-form text (optimal reading)
    - Generous whitespace around content blocks (min 48px vertical spacing)
    - UI controls recede visually when not in focus

[ ] **Principle 2: Progressive Disclosure**
Present information in layers. Show essential content first, reveal complexity on demand.

    Implementation:
    - Use CollapsibleTextBlock for supplementary information
    - Navigation dropdowns appear on hover/focus
    - Mobile navigation collapses to hamburger menu

### B. Systematic Consistency

[ ] **Principle 3: Design Token Governance**
All visual properties derive from a single source of truth: CSS custom properties defined in `globals.css`.

    Implementation:
    - Never use hardcoded colors (use `hsl(var(--property))`)
    - Spacing values must come from the scale (4, 8, 12, 16, 24, 32, 48, 64, 96px)
    - Border radius uses `--radius` variable exclusively

[ ] **Principle 4: Component Composability**
Build complex UI from simple, reusable primitives. Each component has a single responsibility.

    Implementation:
    - Use shadcn/ui components as base primitives
    - Extend via variant props, not style overrides
    - Block components compose smaller UI components

### C. Inclusive Access

[ ] **Principle 5: Universal Accessibility**
Every user, regardless of ability or device, must have equal access to all functionality and content.

    Implementation:
    - WCAG 2.1 AA compliance minimum
    - Keyboard navigation for all interactive elements
    - Screen reader announcements for dynamic content
    - AccessibilityProvider for user-controlled font size/contrast

[ ] **Principle 6: Multilingual Equity**
All three languages (UK, EN, ES) are first-class citizens. No language receives diminished functionality or visual treatment.

    Implementation:
    - Localized content fields in Payload CMS
    - Language switcher always accessible
    - Text expansion accommodated in layouts (ES often 20-30% longer than EN)

### D. Performance as Design

[ ] **Principle 7: Perceived Performance**
Speed is a feature. Design for perceived performance through optimistic UI, skeleton states, and progressive loading.

    Implementation:
    - Server Components by default (zero client JS)
    - Client Components only for interactivity (`'use client'`)
    - Skeleton loading states for async content
    - Image optimization via Next.js Image component

---

## II. Color System

A semantic color system built on HSL values for consistent theming and dark mode support.

### A. Core Palette

The platform uses CSS custom properties for all colors, enabling theme switching and consistent application.

#### Light Mode (`:root`)

| Token                      | HSL Value           | Usage                           |
| -------------------------- | ------------------- | ------------------------------- |
| `--background`             | `0 0% 100%`         | Page backgrounds                |
| `--foreground`             | `240 10% 3.9%`      | Primary text                    |
| `--card`                   | `0 0% 100%`         | Card backgrounds                |
| `--card-foreground`        | `240 10% 3.9%`      | Card text                       |
| `--primary`                | `237 84% 67%`       | Primary actions, links (indigo) |
| `--primary-foreground`     | `0 0% 100%`         | Text on primary                 |
| `--secondary`              | `210 40% 96.1%`     | Secondary surfaces              |
| `--secondary-foreground`   | `240 5.9% 10%`      | Secondary text                  |
| `--muted`                  | `210 40% 96.1%`     | Subtle backgrounds              |
| `--muted-foreground`       | `215.4 16.3% 46.9%` | Subtle text                     |
| `--accent`                 | `237 100% 97%`      | Hover states, highlights        |
| `--accent-foreground`      | `225 70% 40%`       | Accent text                     |
| `--destructive`            | `0 84.2% 60.2%`     | Error states, delete actions    |
| `--destructive-foreground` | `0 0% 100%`         | Text on destructive             |
| `--border`                 | `220 13% 91%`       | Borders, dividers               |
| `--input`                  | `220 13% 91%`       | Form input borders              |
| `--ring`                   | `237 84% 67%`       | Focus rings                     |

#### Dark Mode (`.dark`)

| Token                  | HSL Value        | Usage                      |
| ---------------------- | ---------------- | -------------------------- |
| `--background`         | `240 10% 3.9%`   | Page backgrounds           |
| `--foreground`         | `0 0% 98%`       | Primary text               |
| `--primary`            | `0 0% 98%`       | Primary actions (inverted) |
| `--primary-foreground` | `240 5.9% 10%`   | Text on primary            |
| `--muted`              | `240 3.7% 15.9%` | Subtle backgrounds         |
| `--muted-foreground`   | `240 5% 64.9%`   | Subtle text                |

### B. Semantic Color Guidelines

[ ] Use `primary` for main CTAs, active navigation, important links
`tsx
    className="bg-primary text-primary-foreground"
    `

[ ] Use `secondary` for less prominent actions, secondary buttons
`tsx
    className="bg-secondary text-secondary-foreground"
    `

[ ] Use `muted` for disabled states, placeholder text, subtle UI
`tsx
    className="text-muted-foreground"
    `

[ ] Use `destructive` exclusively for delete, remove, or error states
`tsx
    className="bg-destructive text-destructive-foreground"
    `

[ ] Use `accent` for hover/focus backgrounds on interactive elements
`tsx
    className="hover:bg-accent hover:text-accent-foreground"
    `

### C. Gradient System

Pre-defined gradient presets from `lib/gradients.ts` for decorative elements.

| Preset          | Classes                                      | Use Case                        |
| --------------- | -------------------------------------------- | ------------------------------- |
| `indigo-purple` | `from-indigo-500 to-purple-500`              | Default badges, section headers |
| `indigo-pink`   | `from-indigo-600 via-purple-600 to-pink-600` | Hero headlines                  |
| `blue-cyan`     | `from-blue-500 to-cyan-500`                  | Info highlights                 |
| `green-emerald` | `from-green-500 to-emerald-500`              | Success states                  |
| `orange-red`    | `from-orange-500 to-red-500`                 | Warnings, urgent                |
| `slate-gray`    | `from-slate-600 to-gray-600`                 | Neutral decorative              |

**Gradient Rules:**
[ ] Apply gradients only to decorative elements (badges, backgrounds), never to functional UI
[ ] Use `bg-gradient-to-r` direction consistently (left to right)
[ ] Pair gradient backgrounds with white text (`text-white`)
[ ] Limit to one gradient per visible viewport area

### D. Contrast Requirements

[ ] Body text on backgrounds: minimum 4.5:1 contrast ratio
[ ] Large text (18px+ or 14px+ bold): minimum 3:1 contrast ratio
[ ] UI components and graphics: minimum 3:1 against adjacent colors
[ ] Focus indicators: minimum 3:1 against background

**Testing Tools:**

- Chrome DevTools Accessibility panel
- WebAIM Contrast Checker
- axe DevTools browser extension

---

## III. Typography

A scalable type system built on Tailwind's default font stack with explicit sizing for content hierarchy.

### A. Font Stack

```css
font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
```

**Rationale:** System fonts ensure optimal rendering across all three language scripts (Latin for EN/ES, Cyrillic for UK) without font loading overhead.

### B. Type Scale

| Element  | Tailwind Classes                                | Size (Desktop) | Line Height | Weight |
| -------- | ----------------------------------------------- | -------------- | ----------- | ------ |
| H1       | `text-4xl lg:text-5xl font-bold tracking-tight` | 36px / 48px    | 1.1         | 700    |
| H2       | `text-3xl font-semibold tracking-tight`         | 30px           | 1.2         | 600    |
| H3       | `text-2xl font-semibold tracking-tight`         | 24px           | 1.3         | 600    |
| H4       | `text-xl font-semibold tracking-tight`          | 20px           | 1.4         | 600    |
| Body     | `text-base leading-7`                           | 16px           | 1.75        | 400    |
| Small    | `text-sm`                                       | 14px           | 1.5         | 400    |
| Caption  | `text-xs`                                       | 12px           | 1.5         | 400    |
| UI Label | `text-sm font-medium`                           | 14px           | 1.5         | 500    |

### C. Heading Guidelines

[ ] **Semantic hierarchy is mandatory.** Never skip heading levels for visual styling.

````tsx
// Correct: h1 -> h2 -> h3
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

    // Incorrect: skipping h2
    <h1>Page Title</h1>
    <h3>Section</h3> // Wrong
    ```

[ ] **SectionHeaderBlock provides configurable heading levels.** Use `headingLevel` prop to maintain document outline.
`tsx
    <SectionHeaderBlock
      headingLevel="h2"  // Configure based on context
      title="Section Title"
    />
    `

[ ] **One H1 per page.** All pages must have exactly one `<h1>` for accessibility.

[ ] **Use `tracking-tight` on all headings.** Improves readability at larger sizes.

### D. Body Text Guidelines

[ ] **Maximum line length: 75 characters (~768px at 16px).** Prevents eye strain.
`tsx
    className="max-w-prose" // or max-w-2xl/max-w-3xl
    `

[ ] **Line height for body: 1.75 (`leading-7`).** Optimized for long-form reading.

[ ] **Paragraph spacing: `mb-4` between paragraphs.** Consistent rhythm.

[ ] **Never justify text.** Use `text-left` (or `text-right` for RTL). Justified text creates uneven spacing.

### E. UI Text Guidelines

[ ] **Button text: 14px medium (`text-sm font-medium`).** From shadcn/ui button variants.

[ ] **Form labels: 14px medium.** Consistent with Label component.

[ ] **Helper/error text: 12px (`text-xs`).** Subordinate to labels.

[ ] **Navigation: 14px medium (`text-sm font-medium`).** Matches button weight for consistency.

### F. Cyrillic Typography Considerations (Ukrainian)

[ ] **Avoid letter-spacing on Cyrillic text.** `tracking-tight` is acceptable for headings but `tracking-wide`/`tracking-wider` can break Cyrillic rhythm.

[ ] **Test line breaks with longest expected Ukrainian content.** Ukrainian words can be significantly longer than English equivalents.

[ ] **Use proper quotation marks.** Ukrainian uses `«` and `»` (guillemets), not English `"` and `"`.

---

## IV. Spacing & Layout

An 8px base unit system for consistent, harmonious spacing.

### A. Spacing Scale

| Token       | Value | Tailwind              | Use Cases                  |
| ----------- | ----- | --------------------- | -------------------------- |
| `space-0.5` | 2px   | `p-0.5`, `m-0.5`      | Hairline separations       |
| `space-1`   | 4px   | `p-1`, `m-1`, `gap-1` | Icon padding, tight groups |
| `space-2`   | 8px   | `p-2`, `m-2`, `gap-2` | Base unit, inline spacing  |
| `space-3`   | 12px  | `p-3`, `m-3`          | Small component padding    |
| `space-4`   | 16px  | `p-4`, `m-4`, `gap-4` | Default component padding  |
| `space-6`   | 24px  | `p-6`, `m-6`, `gap-6` | Card padding, section gaps |
| `space-8`   | 32px  | `p-8`, `m-8`          | Large section padding      |
| `space-12`  | 48px  | `py-12`, `my-12`      | Section vertical spacing   |
| `space-16`  | 64px  | `py-16`, `my-16`      | Major section breaks       |
| `space-24`  | 96px  | `py-24`, `my-24`      | Hero/footer spacing        |

### B. Layout Principles

[ ] **Use CSS Grid for page layouts, Flexbox for component layouts.**
```tsx
// Page layout
<div className="grid grid-cols-1 md:grid-cols-12 gap-8">

    // Component layout
    <div className="flex items-center gap-4">
    ```

[ ] **Container max-width with horizontal padding.**
`tsx
    <div className="container"> // max-w-screen-2xl mx-auto px-4 md:px-6
    `

[ ] **Consistent vertical rhythm: 48-64px between page sections.**
`tsx
    <section className="py-12 md:py-16">
    `

### C. Component Spacing Patterns

| Component Type   | Internal Padding          | External Margin       |
| ---------------- | ------------------------- | --------------------- |
| Cards            | `p-6` (24px)              | `mb-6` or grid gap    |
| Buttons          | `px-4 py-2` / `px-6 py-3` | Inline gap-4          |
| Form fields      | `px-3 py-2`               | `mb-4` between fields |
| Section headers  | -                         | `mb-8` to `mb-12`     |
| List items       | `py-2` or `py-3`          | -                     |
| Navigation links | `px-4 py-2`               | -                     |

### D. Border Radius System

All border radius values derive from the `--radius` CSS variable (default `0.75rem` / 12px).

| Token         | Value  | Tailwind       | Use Cases                      |
| ------------- | ------ | -------------- | ------------------------------ |
| `radius-sm`   | 8px    | `rounded-sm`   | Badges, tags, small buttons    |
| `radius-md`   | 10px   | `rounded-md`   | Buttons, inputs, small cards   |
| `radius-lg`   | 12px   | `rounded-lg`   | Cards, dialogs, large surfaces |
| `radius-xl`   | 16px   | `rounded-xl`   | Hero sections, featured cards  |
| `radius-2xl`  | 24px   | `rounded-2xl`  | Call-to-action blocks          |
| `radius-full` | 9999px | `rounded-full` | Avatars, pill badges           |

[ ] **Match radius to component scale.** Larger surfaces use larger radii.

[ ] **Nested elements use smaller radii.**
`tsx
    <div className="rounded-xl p-6"> // Outer: xl
      <button className="rounded-md"> // Inner: md
    </div>
    `

---

## V. Component Design Patterns

Guidelines for implementing and composing UI components.

### A. Block Component Architecture

Payload CMS blocks follow a consistent pattern:

```tsx
// Block component structure
export interface [BlockName]BlockProps {
  // Required props from CMS
  // Optional customization props
  id?: string
}

export function [BlockName]Block({ ...props }: [BlockName]BlockProps) {
  // Early return for invalid states
  if (!requiredProp) return null

  // Render
  return (
    <section className="...">
      {/* Content */}
    </section>
  )
}
````

[ ] **All blocks accept an optional `id` prop** for anchor linking.

[ ] **Blocks are Server Components by default.** Add `'use client'` only when hooks/state required.

[ ] **RenderBlocks handles block rendering via switch statement.**
``tsx
    switch (block.blockType) {
      case 'sectionHeader':
        return <SectionHeaderBlock key={key} {...props} />
      default:
        console.warn(`Unknown block type: ${block.blockType}`)
        return null
    }
    ``

### B. Button Variants (shadcn/ui)

Use the established button variants consistently:

| Variant       | Use Case          | Example                 |
| ------------- | ----------------- | ----------------------- |
| `default`     | Primary actions   | Submit, Save, Confirm   |
| `secondary`   | Secondary actions | Cancel, Back, Filter    |
| `outline`     | Tertiary actions  | Edit, View details      |
| `ghost`       | Subtle actions    | Icon buttons, nav items |
| `link`        | Inline navigation | "Learn more", "See all" |
| `destructive` | Dangerous actions | Delete, Remove          |

| Size            | Use Case           |
| --------------- | ------------------ |
| `default` (h-9) | Standard buttons   |
| `sm` (h-8)      | Compact UI, tables |
| `lg` (h-10)     | Hero CTAs, forms   |
| `icon` (size-9) | Icon-only buttons  |

[ ] **Always include accessible labels for icon buttons.**
`tsx
    <Button size="icon" aria-label="Close dialog">
      <X className="h-4 w-4" />
    </Button>
    `

### C. Card Patterns

Cards are the primary container for grouped content:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>{/* Primary content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

[ ] **Cards have consistent internal spacing:** `p-6` for content areas.

[ ] **Interactive cards need hover states:**
`tsx
    className="transition-shadow hover:shadow-lg"
    `

[ ] **Link cards wrap the entire card in `<Link>` or use `asChild`.**

### D. Form Patterns

[ ] **All inputs require associated labels.** Use shadcn Form component.
`tsx
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Optional helper text</FormDescription>
          <FormMessage /> {/* Validation errors */}
        </FormItem>
      )}
    />
    `

[ ] **Error states use `aria-invalid` and `destructive` color.**

[ ] **Group related fields with `<fieldset>` and `<legend>`.**

[ ] **Submit buttons indicate loading state.**
`tsx
    <Button disabled={isSubmitting}>
      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}
    </Button>
    `

### E. Icon Usage (Lucide)

Icons from the `lib/icons.ts` icon map.

[ ] **Standard icon size: 16px (h-4 w-4).**

[ ] **Icons in buttons use automatic sizing via CVA:**
`tsx
    // Button component handles [&_svg]:size-4 automatically
    <Button><Download />Download</Button>
    `

[ ] **Decorative icons: `aria-hidden="true"`**

[ ] **Functional icons: include `aria-label` or visible text**

[ ] **Icon color inherits from text color (`currentColor`).**

---

## VI. Accessibility Standards

WCAG 2.1 Level AA compliance requirements.

### A. Perceivable

[ ] **1.1.1 Non-text Content:** All images have meaningful `alt` text. Decorative images use `alt=""`.
`tsx
    <Image
      src={image.url}
      alt={image.alt || ''} // Fallback to empty for decorative
    />
    `

[ ] **1.3.1 Info and Relationships:** Use semantic HTML. Headings (`h1`-`h6`), lists (`ul`/`ol`), tables (`table`).

[ ] **1.3.2 Meaningful Sequence:** DOM order matches visual order. No CSS-only reordering that breaks logic.

[ ] **1.4.1 Use of Color:** Color is not the only indicator. Combine with icons, text, patterns.

````tsx
// Incorrect: color only
<span className="text-red-500">Error</span>

    // Correct: color + icon + text
    <span className="text-destructive flex items-center gap-1">
      <AlertCircle className="h-4 w-4" />
      Error: Invalid email
    </span>
    ```

[ ] **1.4.3 Contrast (Minimum):** 4.5:1 for normal text, 3:1 for large text.

[ ] **1.4.4 Resize Text:** Content remains functional at 200% zoom.

[ ] **1.4.10 Reflow:** No horizontal scrolling at 320px viewport width.

[ ] **1.4.11 Non-text Contrast:** UI components and graphics have 3:1 contrast.

### B. Operable

[ ] **2.1.1 Keyboard:** All functionality available via keyboard.

[ ] **2.1.2 No Keyboard Trap:** Focus can always be moved away from any component.

[ ] **2.4.1 Bypass Blocks:** Skip link to main content.
`tsx
    <a href="#main" className="sr-only focus:not-sr-only">
      Skip to main content
    </a>
    `

[ ] **2.4.3 Focus Order:** Logical tab sequence following visual layout.

[ ] **2.4.4 Link Purpose:** Link text describes destination. Avoid "click here".

[ ] **2.4.6 Headings and Labels:** Descriptive headings and form labels.

[ ] **2.4.7 Focus Visible:** Clear focus indicators on all interactive elements.
`tsx
    // Button component includes:
    focus-visible:ring-ring/50 focus-visible:ring-[3px]
    `

[ ] **2.5.3 Label in Name:** Visible label matches accessible name.

### C. Understandable

[ ] **3.1.1 Language of Page:** `lang` attribute on `<html>` element.
`tsx
    <html lang={locale}> // "uk", "en", or "es"
    `

[ ] **3.1.2 Language of Parts:** Mark inline language changes.
`tsx
    <span lang="en">English phrase</span>
    `

[ ] **3.2.1 On Focus:** No unexpected context changes on focus.

[ ] **3.2.2 On Input:** No unexpected context changes on input (unless warned).

[ ] **3.3.1 Error Identification:** Errors clearly identified and described.

[ ] **3.3.2 Labels or Instructions:** Form inputs have clear labels.

### D. Robust

[ ] **4.1.1 Parsing:** Valid HTML markup.

[ ] **4.1.2 Name, Role, Value:** Custom controls have appropriate ARIA attributes.

### E. AccessibilityProvider Features

The platform includes an AccessibilityProvider for user-controlled settings:

```tsx
// Available settings
const { fontSize, setFontSize, bwMode, setBwMode } = useAccessibility()

// Font sizes: 'small' (0.875em), 'medium' (1em), 'large' (1.125em)
// bwMode: grayscale filter for reduced visual noise
````

[ ] **Provide UI controls for users to adjust these settings.**

[ ] **Persist settings to localStorage for return visits.**

---

## VII. Responsive Design

Mobile-first approach with defined breakpoints.

### A. Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Target Devices               |
| ---------- | --------- | --------------- | ---------------------------- |
| Default    | 0px       | (none)          | Mobile phones                |
| `sm`       | 640px     | `sm:`           | Large phones, small tablets  |
| `md`       | 768px     | `md:`           | Tablets (portrait)           |
| `lg`       | 1024px    | `lg:`           | Tablets (landscape), laptops |
| `xl`       | 1280px    | `xl:`           | Desktops                     |
| `2xl`      | 1536px    | `2xl:`          | Large desktops               |

### B. Responsive Patterns

[ ] **Mobile-first: Start with mobile styles, add complexity upward.**
`tsx
    // Mobile: stack, Desktop: row
    className="flex flex-col md:flex-row"
    `

[ ] **Typography scales responsively.**
`tsx
    // H1 example
    className="text-4xl lg:text-5xl" // 36px -> 48px
    `

[ ] **Container uses responsive padding.**
`tsx
    className="px-4 md:px-6 lg:px-8"
    `

[ ] **Navigation transforms at `md` breakpoint.** - Mobile: Hamburger menu (`md:hidden`) - Desktop: Horizontal nav (`hidden md:flex`)

[ ] **Grid columns adjust per breakpoint.**
`tsx
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    `

### C. Touch Targets

[ ] **Minimum touch target: 44x44px (iOS) / 48x48px (Android).**
`tsx
    // Button 'icon' size is 36px, add padding:
    className="p-2" // +16px = 52px total
    `

[ ] **Adequate spacing between touch targets: minimum 8px.**

### D. Responsive Images

[ ] **Use Next.js Image component with `sizes` attribute.**
`tsx
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
    `

[ ] **Provide responsive image ratios.**
`tsx
    className="aspect-video md:aspect-[4/3] lg:aspect-[16/9]"
    `

---

## VIII. Motion & Animation

Purposeful, performant animation guidelines.

### A. Animation Principles

[ ] **Motion serves function.** Every animation should: - Guide attention - Show relationships - Provide feedback - Or indicate state change

[ ] **Respect user preferences.**
`css
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    `

[ ] **Use Framer Motion (`motion/react`) for complex animations.**

### B. Timing Guidelines

| Type   | Duration  | Easing        | Use Case                           |
| ------ | --------- | ------------- | ---------------------------------- |
| Micro  | 100-150ms | `ease-out`    | Button states, toggles             |
| Short  | 200-250ms | `ease-out`    | Accordions, tooltips               |
| Medium | 300-400ms | `ease-in-out` | Page transitions, modals           |
| Long   | 500ms+    | Custom        | Hero animations, complex sequences |

### C. Standard Animations (Tailwind)

```tsx
// Built-in animations
className = 'animate-spin' // Loading spinners
className = 'animate-ping' // Notification dots
className = 'animate-pulse' // Skeleton loading
className = 'animate-bounce' // Attention (use sparingly)
```

### D. Block Animation Pattern (SectionHeaderBlock)

```tsx
// Entrance animation with motion/react
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

[ ] **Provide `enableAnimation` prop for blocks.** Allows disabling per-instance.

[ ] **Stagger child animations for lists.**
`tsx
    transition={{ delay: index * 0.1 }}
    `

### E. Transition Patterns

| Component | Transition                                  |
| --------- | ------------------------------------------- |
| Buttons   | `transition-all` (includes scale on active) |
| Links     | `transition-colors`                         |
| Cards     | `transition-shadow`                         |
| Dropdowns | `transition-opacity` + height               |
| Modals    | Fade + scale (via Radix)                    |

### F. Animation Anti-Patterns

[ ] **Avoid:** Animations longer than 500ms for UI feedback
[ ] **Avoid:** Continuous looping animations (except loading states)
[ ] **Avoid:** Motion that moves content unexpectedly
[ ] **Avoid:** Animations that block user interaction

---

## IX. Localization Design

Design considerations for trilingual support (UK, EN, ES).

### A. Text Expansion

Different languages require different space. Plan for the longest:

| Language       | Expansion vs English |
| -------------- | -------------------- |
| Ukrainian (UK) | +20-30%              |
| Spanish (ES)   | +20-30%              |
| English (EN)   | Baseline             |

[ ] **Design layouts for 130% text length.**

[ ] **Use flexible containers, not fixed widths for text.**

````tsx
// Correct: flexible
className="max-w-prose"

    // Avoid: fixed
    className="w-[200px]"
    ```

[ ] **Test all UI with longest language variant.**

### B. Language Switcher

[ ] **Always visible and accessible.** Currently in Header component.

[ ] **Use language codes (UK, EN, ES), not flags.** Flags represent countries, not languages.

[ ] **Preserve scroll position on language switch.**

[ ] **URL structure: `/{locale}/path`** (e.g., `/uk/news`, `/en/news`)

### C. Content Field Patterns

In Payload CMS, localized fields:

```typescript
{
  name: 'title',
  type: 'text',
  localized: true, // Content stored per-locale
}
````

[ ] **All user-facing content fields should be `localized: true`.**

[ ] **Slugs transliterate Cyrillic to Latin.**
`typescript
    // "Привіт" -> "pryvit"
    import { transliterate } from '@/lib/transliterate'
    `

### D. Number and Date Formatting

[ ] **Use `Intl` API for locale-aware formatting.**

````tsx
// Dates
new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)

    // UK: "6 січня 2025 р."
    // EN: "January 6, 2025"
    // ES: "6 de enero de 2025"

    // Numbers
    new Intl.NumberFormat(locale).format(number)
    ```

[ ] **Currency formatting with locale.**
`tsx
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'UAH' // or 'USD', 'EUR'
    }).format(amount)
    `

### E. RTL Preparedness

While current languages (UK, EN, ES) are LTR, design for potential RTL support:

[ ] **Use logical properties where possible.**
```tsx
// Logical (RTL-safe)
className="ps-4" // padding-inline-start
className="ms-4" // margin-inline-start
className="text-start"

    // Physical (may need override for RTL)
    className="pl-4"  // padding-left
    className="ml-4"  // margin-left
    className="text-left"
    ```

[ ] **Use Flexbox `gap` instead of margins between items.**

[ ] **Icons with directional meaning (arrows) may need mirroring for RTL.**

---

## X. Implementation Checklist

Quick-reference checklists for common implementation scenarios.

### A. New Block Component

[ ] Create file: `src/components/[BlockName]Block.tsx`
[ ] Define props interface with `id?: string`
[ ] Use Server Component unless interactivity needed
[ ] Handle empty/invalid states with early return
[ ] Add to `RenderBlocks.tsx` switch statement
[ ] Add TypeScript type to `BlockData` union
[ ] Test with all three languages
[ ] Test responsive behavior at all breakpoints
[ ] Verify keyboard navigation
[ ] Check color contrast compliance

### B. New Page Template

[ ] Use semantic HTML structure (`header`, `main`, `footer`, `nav`)
[ ] Include exactly one `<h1>`
[ ] Ensure skip link functionality
[ ] Add meta tags for SEO (via `lib/seo.ts`)
[ ] Set `lang` attribute correctly
[ ] Test with screen reader
[ ] Verify mobile layout

### C. Form Implementation

[ ] Use shadcn Form component with react-hook-form
[ ] All inputs have associated labels
[ ] Error messages are descriptive
[ ] Submit button shows loading state
[ ] Focus management after submission
[ ] Keyboard submission works (Enter key)
[ ] Error states use `aria-invalid`

### D. Interactive Component

[ ] Add `'use client'` directive
[ ] Implement keyboard handlers
[ ] Add appropriate ARIA attributes
[ ] Handle focus management
[ ] Respect `prefers-reduced-motion`
[ ] Test with keyboard-only navigation
[ ] Test with screen reader

### E. Pre-Deployment Accessibility Audit

[ ] Run axe DevTools on all page templates
[ ] Verify heading hierarchy (h1-h6 sequence)
[ ] Check all images have alt text
[ ] Test keyboard navigation end-to-end
[ ] Verify focus indicators are visible
[ ] Check color contrast ratios
[ ] Test at 200% browser zoom
[ ] Test at 320px viewport width
[ ] Validate HTML markup

---

## Appendix: Quick Reference

### Color Tokens

```css
--primary: 237 84% 67% /* Indigo - main actions */ --secondary: 210 40% 96.1%
  /* Light gray - secondary */ --destructive: 0 84.2% 60.2% /* Red - errors/delete */
  --muted-foreground: 215.4 16.3% 46.9% /* Gray text */;
````

### Spacing Scale

```
4px (p-1) | 8px (p-2) | 12px (p-3) | 16px (p-4) | 24px (p-6) | 32px (p-8) | 48px (p-12) | 64px (p-16)
```

### Breakpoints

```
sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
```

### Type Scale

```
H1: text-4xl lg:text-5xl font-bold tracking-tight
H2: text-3xl font-semibold tracking-tight
H3: text-2xl font-semibold tracking-tight
Body: text-base leading-7
Small: text-sm
```

### Border Radius

```
--radius: 0.75rem (12px)
rounded-sm: 8px | rounded-md: 10px | rounded-lg: 12px | rounded-full: pill
```

### Animation Durations

```
Micro: 100-150ms | Short: 200-250ms | Medium: 300-400ms | Long: 500ms+
```

---

_Document maintained by the frontend engineering team. Last updated: January 2025._
