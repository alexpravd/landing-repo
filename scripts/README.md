# Scripts

This folder contains utility scripts for managing the Payload CMS platform.

## Available Scripts

### `create-admin.ts`

Creates an admin user for the platform.

```bash
npm run create-admin
```

**Default credentials:**

- Email: `admin@example.com`
- Password: `admin123`

### `cleanup-db.ts`

⚠️ **Cleanup Script** - Deletes all content from the database before seeding.

```bash
npm run cleanup
```

**What gets deleted:**

- All navigation items
- All pages
- All news articles
- All news tags

**What is preserved:**

- Users (admin accounts)
- Media files (commented option to delete)

**Safety features:**

- Requires confirmation before deletion
- Clear warning message
- Cannot be run accidentally

### `seed-demo-data.ts`

Seeds the database with **comprehensive bilingual demo content** (Ukrainian + English) including news tags, articles, pages, and navigation.

```bash
npm run seed
```

**What gets created:**

**News Tags (8 items - bilingual UA/EN):**

- Інновації / Innovation - Indigo
- Бізнес / Business - Blue
- Освіта / Education - Green
- Технології / Technology - Purple
- Наука / Science - Teal
- Спільнота / Community - Pink
- Стартапи / Startups - Amber
- Дизайн / Design - Red

**News Articles (20 items - bilingual UA/EN):**

1. "Штучний інтелект змінює освіту в Україні" / "Artificial Intelligence Transforms Education in Ukraine"
2. "Український стартап залучив $10 млн інвестицій" / "Ukrainian Startup Raises $10M Investment"
3. "Прорив у квантових обчисленнях: нова ера технологій" / "Quantum Computing Breakthrough"
4. "Міжнародний хакатон TechForGood 2025" / "International Hackathon TechForGood 2025"
5. "Новий тренд у веб-дизайні: мінімалізм 2.0" / "New Web Design Trend: Minimalism 2.0"
6. "Блокчейн у державному управлінні: досвід Естонії" / "Blockchain in Government: Estonia's Experience"
7. "Зелені технології: як стартапи рятують планету" / "Green Tech: How Startups Save the Planet"
8. "Майбутнє роботи: віддалена співпраця у 2025" / "The Future of Work: Remote Collaboration in 2025"
9. "Кібербезпека для малого бізнесу: практичні поради" / "Cybersecurity for Small Business: Practical Tips"
10. "Нейронні мережі у медицині: діагностика майбутнього" / "Neural Networks in Medicine"
11. "Едтех революція: як навчаються нові покоління" / "EdTech Revolution: How New Generations Learn"
12. "Фінтех тренди 2025: що чекає на банківський сектор" / "Fintech Trends 2025"
13. "Космічні технології: приватні компанії виходять на орбіту" / "Space Tech: Private Companies Reach Orbit"
14. "UX/UI тренди 2025: користувацький досвід нового рівня" / "UX/UI Trends 2025"
15. "Віртуальна реальність у навчанні" / "Virtual Reality in Education"
16. "Етичний ШІ: як забезпечити відповідальність алгоритмів" / "Ethical AI"
17. "Соціальні мережі майбутнього: децентралізація та приватність" / "Social Networks of the Future"
18. "Агротех: як технології змінюють сільське господарство" / "AgriTech: How Technology Transforms Agriculture"
19. "Майбутнє транспорту: електромобілі та автономні авто" / "Future of Transportation"
20. "Нові тренди в кібербезпеці: підготовка до загроз 2025" / "New Cybersecurity Trends" (Draft)

**Status:** 19 published, 1 draft

**Pages (9 items - bilingual UA/EN):**

1. **Головна / Home** (`/uk` or `/en`) - Home page with carousel, grid, and markdown blocks
2. **Всі новини / All News** (`/uk/news` or `/en/news`) - News list page with search, filters, and pagination
3. **Про нас / About Us** (`/uk/about` or `/en/about`) - About page with markdown and CTA blocks
4. **Демо сторінка / Demo Page** (`/uk/demo` or `/en/demo`) - All block types demonstration
   5-8. **Category Pages** - Innovation, Business, Education, Technology (filtered news by tag)

**Navigation Items (4 items - bilingual UA/EN):**

1. **Головна / Home** - Links to home page
2. **Новини / News** - Dropdown with:
   - Категорії / Categories:
     - Всі новини / All News
     - Інновації / Innovation
     - Бізнес / Business
     - Освіта / Education
     - Технології / Technology
3. **Про нас / About** - Links to about page
4. **Ресурси / Resources** - Dropdown with:
   - Корисне / Useful: Demo Page, Documentation, API
   - Спільнота / Community: GitHub, Discord, Twitter

## Usage Notes

### First Time Setup

1. Make sure your database is running
2. Create an admin user first:
   ```bash
   npm run create-admin
   ```
3. Then seed demo data:
   ```bash
   npm run seed
   ```

### Re-seeding Data

If you want to re-seed with fresh data, you have two options:

**Option 1: Cleanup then seed (recommended)**

```bash
# Step 1: Clean the database
npm run cleanup

# Step 2: Seed fresh data
npm run seed
```

**Option 2: Combined command (one-step)**

```bash
# Cleanup and seed in one command
npm run seed:fresh
```

This will:

1. Delete all navigation, pages, news, and tags
2. Preserve users and media
3. Ask for confirmation before deletion
4. Seed fresh bilingual demo data

**Manual cleanup alternative:**

- Clear the database manually through MongoDB, or
- Use Payload admin to delete existing content first

### Customization

To customize the demo data, edit `scripts/seed-demo-data.ts`:

- Add more news tags
- Create additional articles with different content
- Modify page structures and blocks
- Change locales (currently using `uk` - Ukrainian)

### Adding Featured Images

The seed script doesn't include featured images for news articles. To add them:

1. Go to Payload admin: `http://localhost:3000/admin`
2. Navigate to News collection
3. Edit each article and upload a featured image

**Tip:** Use free stock photo services like Unsplash, Pexels, or Pixabay for technology/innovation themed images.

### Features Demonstrated

The comprehensive seed data demonstrates ALL platform capabilities:

✅ **Content:**

- Bilingual content (Ukrainian + English)
- 20 diverse news articles with different topics
- 8 color-coded news tags
- Multiple page types (home, news, text)
- Published and draft statuses

✅ **News Blocks:**

- List mode with search, filters, and pagination
- Carousel mode with multiple items
- Grid mode with featured + small cards
- Content sources: all news, by tag, manual selection

✅ **Block Types:**

- Section Header (big and small)
- Markdown Text with accent colors
- Call to Action with links
- News Block (all 3 modes)
- Image Block (structure ready)

✅ **Navigation:**

- Multi-level dropdowns (2 levels)
- Page relationships
- Custom URLs
- External links (open in new tab)
- Proper ordering

✅ **SEO:**

- Meta titles and descriptions
- Focus keywords
- Open Graph tags
- Canonical URLs
- NoIndex for draft content

✅ **Technical:**

- Cyrillic transliteration in URLs
- Localized content
- Version history
- Author relationships
- Tag filtering and search

### Multi-language Support

✅ **The seed script now creates fully bilingual content!**

All content is created in both Ukrainian (`uk`) and English (`en`):

- All news tags have UA + EN names and descriptions
- All 20 news articles have UA + EN titles, excerpts, and content
- All 9 pages have UA + EN titles and blocks
- All 4 navigation items have UA + EN labels

**Access different languages:**

- Ukrainian: `http://localhost:3000/uk`
- English: `http://localhost:3000/en`

## Quick Commands Reference

```bash
# Create admin user (first time only)
npm run create-admin

# Seed demo data (first time or add to existing)
npm run seed

# Clean database (delete all content except users/media)
npm run cleanup

# Clean and seed in one step (fresh start)
npm run seed:fresh
```

## Troubleshooting

**Error: Cannot connect to database**

- Make sure MongoDB is running
- Check your `.env` file for correct `DATABASE_URI`

**Error: Admin user already exists**

- Skip the create-admin step if you already have an admin user
- Or delete the existing admin user from the database first

**Error: Duplicate key error**

- This happens when seeding multiple times without cleanup
- Run `npm run cleanup` first, then seed again
- Or use `npm run seed:fresh` for one-step cleanup + seed

**Cleanup confirmation not showing**

- Make sure you're running in an interactive terminal
- The script requires typing "yes" to confirm deletion
- Press Ctrl+C to cancel if needed

## Development

These scripts use:

- `tsx` for TypeScript execution
- Payload's `getPayload()` API
- Direct database operations via Payload collections

To create a new script:

1. Create a new `.ts` file in this folder
2. Follow the pattern from existing scripts
3. Add the script to `package.json`
4. Document it in this README
