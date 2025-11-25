import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// Map tag colors to valid accent colors
function mapToAccentColor(tagColor: string): string {
  const colorMap: Record<string, string> = {
    'indigo': 'indigo',
    'blue': 'blue',
    'purple': 'purple',
    'green': 'green',
    'amber': 'amber',
    'red': 'purple',    // Map red to purple
    'pink': 'purple',   // Map pink to purple
    'teal': 'green',    // Map teal to green
  }
  return colorMap[tagColor] || 'indigo' // Default to indigo
}

async function seedDemoData() {
  try {
    console.log('🌱 Initializing Payload...')
    const payload = await getPayload({ config })

    console.log('\n📦 Seeding comprehensive demo data (UA + EN)...\n')

    // Get admin user for authorship
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })
    const adminUser = users.docs[0]

    if (!adminUser) {
      console.error('❌ No admin user found. Please run "npm run create-admin" first.')
      process.exit(1)
    }

    // ============================================
    // 1. Create News Tags (Bilingual)
    // ============================================
    console.log('📌 Creating News Tags (UA + EN)...')

    const tags = [
      { name: { uk: 'Інновації', en: 'Innovation' }, slug: 'innovations', color: 'indigo', desc: { uk: 'Новини про інновації та технології', en: 'News about innovations and technology' } },
      { name: { uk: 'Бізнес', en: 'Business' }, slug: 'business', color: 'blue', desc: { uk: 'Бізнес новини та економіка', en: 'Business news and economics' } },
      { name: { uk: 'Освіта', en: 'Education' }, slug: 'education', color: 'green', desc: { uk: 'Новини освіти та навчання', en: 'Education and learning news' } },
      { name: { uk: 'Технології', en: 'Technology' }, slug: 'technology', color: 'purple', desc: { uk: 'Технологічні новини', en: 'Technology news' } },
      { name: { uk: 'Наука', en: 'Science' }, slug: 'science', color: 'teal', desc: { uk: 'Наукові дослідження та відкриття', en: 'Scientific research and discoveries' } },
      { name: { uk: 'Спільнота', en: 'Community' }, slug: 'community', color: 'pink', desc: { uk: 'Новини спільноти', en: 'Community news' } },
      { name: { uk: 'Стартапи', en: 'Startups' }, slug: 'startups', color: 'amber', desc: { uk: 'Новини стартапів', en: 'Startup news' } },
      { name: { uk: 'Дизайн', en: 'Design' }, slug: 'design', color: 'red', desc: { uk: 'UI/UX та дизайн', en: 'UI/UX and design' } },
    ]

    const createdTags: any[] = []

    for (const tag of tags) {
      // Create with Ukrainian locale
      const createdTag = await payload.create({
        collection: 'news-tags',
        data: {
          name: tag.name.uk,
          slug: tag.slug,
          color: tag.color,
          description: tag.desc.uk,
        },
        locale: 'uk',
      })

      // Update with English locale
      await payload.update({
        collection: 'news-tags',
        id: createdTag.id,
        data: {
          name: tag.name.en,
          description: tag.desc.en,
        },
        locale: 'en',
      })

      createdTags.push(createdTag)
      console.log(`  ✓ Created: ${tag.name.uk} / ${tag.name.en}`)
    }

    // ============================================
    // 2. Create News Articles (Bilingual - 20 articles)
    // ============================================
    console.log('\n📰 Creating News Articles (UA + EN)...')

    const newsArticles = [
      {
        title: { uk: 'Штучний інтелект змінює освіту в Україні', en: 'Artificial Intelligence Transforms Education in Ukraine' },
        slug: 'ai-transforms-education-in-ukraine',
        publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: [0, 2, 3], // Innovation, Education, Technology
        excerpt: {
          uk: 'Нові технології штучного інтелекту відкривають безпрецедентні можливості для персоналізованого навчання та підвищення якості освіти.',
          en: 'New artificial intelligence technologies unlock unprecedented opportunities for personalized learning and improving education quality.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Український стартап залучив $10 млн інвестицій', en: 'Ukrainian Startup Raises $10M Investment' },
        slug: 'ukrainian-startup-raises-10m',
        publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: [1, 6], // Business, Startups
        excerpt: {
          uk: 'Молодий український стартап у сфері фінтех успішно завершив серію А інвестицій від провідних венчурних фондів.',
          en: 'A young Ukrainian fintech startup successfully completed Series A funding from leading venture capital funds.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Прорив у квантових обчисленнях: нова ера технологій', en: 'Quantum Computing Breakthrough: A New Era of Technology' },
        slug: 'quantum-computing-breakthrough',
        publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: [4, 3, 0], // Science, Technology, Innovation
        excerpt: {
          uk: 'Дослідницька група досягла значного прогресу в розробці стабільних квантових кубітів.',
          en: 'Research team achieves significant progress in developing stable quantum qubits.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Міжнародний хакатон TechForGood 2025', en: 'International Hackathon TechForGood 2025' },
        slug: 'techforgood-hackathon-2025',
        publishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        tags: [5, 3, 0], // Community, Technology, Innovation
        excerpt: {
          uk: 'Понад 500 учасників з усього світу змагалися за створення інноваційних рішень для соціальних проблем.',
          en: 'Over 500 participants from around the world competed to create innovative solutions for social problems.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Новий тренд у веб-дизайні: мінімалізм 2.0', en: 'New Web Design Trend: Minimalism 2.0' },
        slug: 'minimalism-2-web-design-trend',
        publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: [7, 3], // Design, Technology
        excerpt: {
          uk: 'Дизайнери по всьому світу переосмислюють мінімалістичний підхід до веб-дизайну.',
          en: 'Designers worldwide are reimagining the minimalist approach to web design.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Блокчейн у державному управлінні: досвід Естонії', en: 'Blockchain in Government: Estonia\'s Experience' },
        slug: 'blockchain-government-estonia',
        publishedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        tags: [3, 0, 1], // Technology, Innovation, Business
        excerpt: {
          uk: 'Естонія стала першою країною, яка повністю інтегрувала блокчейн у державні послуги.',
          en: 'Estonia became the first country to fully integrate blockchain into government services.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Зелені технології: як стартапи рятують планету', en: 'Green Tech: How Startups Save the Planet' },
        slug: 'green-tech-startups-planet',
        publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: [6, 0, 4], // Startups, Innovation, Science
        excerpt: {
          uk: 'Екологічні стартапи розробляють революційні рішення для боротьби зі зміною клімату.',
          en: 'Environmental startups develop revolutionary solutions to combat climate change.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Майбутнє роботи: віддалена співпраця у 2025', en: 'The Future of Work: Remote Collaboration in 2025' },
        slug: 'future-remote-work-2025',
        publishedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        tags: [3, 1], // Technology, Business
        excerpt: {
          uk: 'Нові інструменти для віддаленої роботи змінюють підхід до корпоративної культури.',
          en: 'New remote work tools are changing the approach to corporate culture.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Кібербезпека для малого бізнесу: практичні поради', en: 'Cybersecurity for Small Business: Practical Tips' },
        slug: 'cybersecurity-small-business-tips',
        publishedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        tags: [3, 1], // Technology, Business
        excerpt: {
          uk: 'Експерти діляться порадами щодо захисту малого бізнесу від кіберзагроз.',
          en: 'Experts share tips on protecting small businesses from cyber threats.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Нейронні мережі у медицині: діагностика майбутнього', en: 'Neural Networks in Medicine: Diagnosis of the Future' },
        slug: 'neural-networks-medicine-diagnosis',
        publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        tags: [0, 3, 4], // Innovation, Technology, Science
        excerpt: {
          uk: 'ШІ допомагає лікарям виявляти хвороби на ранніх стадіях з точністю понад 95%.',
          en: 'AI helps doctors detect diseases at early stages with over 95% accuracy.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Едтех революція: як навчаються нові покоління', en: 'EdTech Revolution: How New Generations Learn' },
        slug: 'edtech-revolution-new-generations',
        publishedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        tags: [2, 3, 0], // Education, Technology, Innovation
        excerpt: {
          uk: 'Онлайн-платформи та VR змінюють спосіб навчання студентів у всьому світі.',
          en: 'Online platforms and VR are changing how students learn worldwide.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Фінтех тренди 2025: що чекає на банківський сектор', en: 'Fintech Trends 2025: What Awaits the Banking Sector' },
        slug: 'fintech-trends-2025-banking',
        publishedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        tags: [1, 3, 0], // Business, Technology, Innovation
        excerpt: {
          uk: 'Цифрові валюти та децентралізовані фінанси кардинально змінюють банківську індустрію.',
          en: 'Digital currencies and decentralized finance are radically changing the banking industry.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Космічні технології: приватні компанії виходять на орбіту', en: 'Space Tech: Private Companies Reach Orbit' },
        slug: 'space-tech-private-companies-orbit',
        publishedDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        tags: [0, 4, 3], // Innovation, Science, Technology
        excerpt: {
          uk: 'Приватні космічні компанії досягли значних успіхів у комерційних польотах.',
          en: 'Private space companies achieved significant success in commercial flights.'
        },
        status: 'published',
      },
      {
        title: { uk: 'UX/UI тренди 2025: користувацький досвід нового рівня', en: 'UX/UI Trends 2025: Next-Level User Experience' },
        slug: 'ux-ui-trends-2025',
        publishedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        tags: [7, 3], // Design, Technology
        excerpt: {
          uk: 'Нові підходи до дизайну інтерфейсів роблять продукти більш інтуїтивними та доступними.',
          en: 'New approaches to interface design make products more intuitive and accessible.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Віртуальна реальність у навчанні: досвід провідних університетів', en: 'Virtual Reality in Education: Leading Universities\' Experience' },
        slug: 'vr-education-universities',
        publishedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        tags: [2, 3, 0], // Education, Technology, Innovation
        excerpt: {
          uk: 'Провідні університети світу активно впроваджують VR технології у навчальний процес.',
          en: 'Leading universities worldwide actively implement VR technologies in education.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Етичний ШІ: як забезпечити відповідальність алгоритмів', en: 'Ethical AI: How to Ensure Algorithm Accountability' },
        slug: 'ethical-ai-algorithm-accountability',
        publishedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        tags: [0, 3, 4], // Innovation, Technology, Science
        excerpt: {
          uk: 'Експерти обговорюють етичні аспекти використання штучного інтелекту.',
          en: 'Experts discuss ethical aspects of artificial intelligence use.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Соціальні мережі майбутнього: децентралізація та приватність', en: 'Social Networks of the Future: Decentralization and Privacy' },
        slug: 'future-social-networks-decentralization',
        publishedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
        tags: [3, 5, 0], // Technology, Community, Innovation
        excerpt: {
          uk: 'Нове покоління соціальних мереж ставить приватність користувачів на перше місце.',
          en: 'New generation of social networks puts user privacy first.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Агротех: як технології змінюють сільське господарство', en: 'AgriTech: How Technology Transforms Agriculture' },
        slug: 'agritech-transforms-agriculture',
        publishedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        tags: [0, 3, 4], // Innovation, Technology, Science
        excerpt: {
          uk: 'Сучасні технології роблять сільське господарство більш ефективним та екологічним.',
          en: 'Modern technologies make agriculture more efficient and ecological.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Майбутнє транспорту: електромобілі та автономні авто', en: 'Future of Transportation: Electric and Autonomous Vehicles' },
        slug: 'future-transport-electric-autonomous',
        publishedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        tags: [3, 0, 4], // Technology, Innovation, Science
        excerpt: {
          uk: 'Автомобільна індустрія переживає найбільшу трансформацію за останні 100 років.',
          en: 'Automotive industry experiences biggest transformation in 100 years.'
        },
        status: 'published',
      },
      {
        title: { uk: 'Нові тренди в кібербезпеці: підготовка до загроз 2025', en: 'New Cybersecurity Trends: Preparing for 2025 Threats' },
        slug: 'cybersecurity-trends-2025-threats',
        publishedDate: new Date(),
        tags: [3, 1], // Technology, Business
        excerpt: {
          uk: 'Експерти прогнозують значні зміни в підходах до кібербезпеки у наступному році.',
          en: 'Experts predict significant changes in cybersecurity approaches next year.'
        },
        status: 'draft',
      },
    ]

    const createdNewsArticles: any[] = []

    for (let i = 0; i < newsArticles.length; i++) {
      const article = newsArticles[i]
      if (!article) continue

      // Create article with Ukrainian content
      const createdArticle = await payload.create({
        collection: 'news',
        data: {
          title: article.title.uk,
          slug: article.slug,
          status: article.status,
          publishedDate: article.publishedDate.toISOString(),
          tags: article.tags.map(idx => createdTags[idx].id),
          excerpt: article.excerpt.uk,
          blocks: [
            {
              blockType: 'markdownText',
              markdown: `## ${article.title.uk}\n\n${article.excerpt.uk}\n\n### Детальніше\n\nЦе приклад статті створеної для демонстрації можливостей платформи. У реальному сценарії тут був би повний текст статті з детальною інформацією.\n\n- Пункт 1\n- Пункт 2\n- Пункт 3\n\n**Висновок:** Це важлива тема для обговорення.`,
              accentColor: mapToAccentColor(createdTags[article.tags[0]].color),
            },
          ],
          author: adminUser.id,
          seo: {
            metaTitle: article.title.uk,
            metaDescription: article.excerpt.uk,
            focusKeyword: article.slug.split('-')[0],
            noIndex: article.status === 'draft',
          },
        },
        locale: 'uk',
      })

      // Update with English content
      await payload.update({
        collection: 'news',
        id: createdArticle.id,
        data: {
          title: article.title.en,
          excerpt: article.excerpt.en,
          blocks: [
            {
              blockType: 'markdownText',
              markdown: `## ${article.title.en}\n\n${article.excerpt.en}\n\n### Learn More\n\nThis is a sample article created to demonstrate the platform's capabilities. In a real scenario, this would contain full article text with detailed information.\n\n- Point 1\n- Point 2\n- Point 3\n\n**Conclusion:** This is an important topic for discussion.`,
              accentColor: mapToAccentColor(createdTags[article.tags[0]].color),
            },
          ],
          seo: {
            metaTitle: article.title.en,
            metaDescription: article.excerpt.en,
          },
        },
        locale: 'en',
      })

      createdNewsArticles.push(createdArticle)
      console.log(`  ✓ Created: ${article.title.uk} / ${article.title.en}`)
    }

    // ============================================
    // 3. Create Pages (Bilingual)
    // ============================================
    console.log('\n📄 Creating Pages (UA + EN)...')

    // Home Page
    const homePage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Головна',
        slug: 'home',
        pageType: 'home',
        status: 'published',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'Ласкаво просимо до інноваційної платформи',
            subtitle: 'Технології • Інновації • Майбутнє',
            description: 'Ми створюємо сучасні рішення для цифрової трансформації бізнесу та освіти',
            badge: {
              text: 'Платформа',
              icon: 'Sparkles',
              gradient: 'indigo-to-purple',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'carousel',
            contentSource: 'all',
            limit: 8,
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'Останні новини',
            subtitle: 'Будьте в курсі подій',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'grid',
            contentSource: 'all',
            limit: 5,
          },
          {
            blockType: 'markdownText',
            markdown: `## Про нашу платформу\n\nМи об'єднуємо інноваторів, підприємців та ентузіастів технологій.\n\n### Наші переваги\n\n- **Інновації** - завжди на крок попереду\n- **Якість** - без компромісів\n- **Спільнота** - сила співпраці`,
            accentColor: 'indigo',
          },
        ],
        seo: {
          metaTitle: 'Головна - Інноваційна платформа',
          metaDescription: 'Сучасна платформа для цифрової трансформації бізнесу та освіти. Новини, інновації, технології.',
          focusKeyword: 'інноваційна платформа',
          noIndex: false,
          ogTitle: 'Головна - Інноваційна платформа',
          ogDescription: 'Сучасна платформа для цифрової трансформації',
        },
      },
      locale: 'uk',
    })

    await payload.update({
      collection: 'pages',
      id: homePage.id,
      data: {
        title: 'Home',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'Welcome to the Innovation Platform',
            subtitle: 'Technology • Innovation • Future',
            description: 'We create modern solutions for digital transformation of business and education',
            badge: {
              text: 'Platform',
              icon: 'Sparkles',
              gradient: 'indigo-to-purple',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'carousel',
            contentSource: 'all',
            limit: 8,
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'Latest News',
            subtitle: 'Stay informed',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'grid',
            contentSource: 'all',
            limit: 5,
          },
          {
            blockType: 'markdownText',
            markdown: `## About Our Platform\n\nWe unite innovators, entrepreneurs, and technology enthusiasts.\n\n### Our Advantages\n\n- **Innovation** - always one step ahead\n- **Quality** - no compromises\n- **Community** - power of collaboration`,
            accentColor: 'indigo',
          },
        ],
        seo: {
          metaTitle: 'Home - Innovation Platform',
          metaDescription: 'Modern platform for digital transformation of business and education. News, innovations, technology.',
          ogTitle: 'Home - Innovation Platform',
          ogDescription: 'Modern platform for digital transformation',
        },
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Головна / Home (Home Page)')

    // All News Page
    const newsPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Всі новини',
        slug: 'news',
        pageType: 'news',
        status: 'published',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'Всі новини',
            subtitle: 'Будьте в курсі останніх подій',
            description: 'Тут ви знайдете всі новини про інновації, технології, бізнес та освіту',
            badge: {
              text: 'Новини',
              icon: 'Newspaper',
              gradient: 'blue-to-indigo',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'list',
            contentSource: 'all',
            enableSearch: true,
            enableFilters: true,
            enablePagination: true,
            itemsPerPage: 12,
          },
        ],
        seo: {
          metaTitle: 'Всі новини - Інноваційна платформа',
          metaDescription: 'Новини про інновації, технології, бізнес та освіту. Останні події та тренди.',
          focusKeyword: 'новини технологій',
          noIndex: false,
        },
      },
      locale: 'uk',
    })

    await payload.update({
      collection: 'pages',
      id: newsPage.id,
      data: {
        title: 'All News',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'All News',
            subtitle: 'Stay updated with latest events',
            description: 'Find all news about innovations, technology, business, and education',
            badge: {
              text: 'News',
              icon: 'Newspaper',
              gradient: 'blue-to-indigo',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'list',
            contentSource: 'all',
            enableSearch: true,
            enableFilters: true,
            enablePagination: true,
            itemsPerPage: 12,
          },
        ],
        seo: {
          metaTitle: 'All News - Innovation Platform',
          metaDescription: 'News about innovations, technology, business, and education. Latest events and trends.',
          focusKeyword: 'technology news',
        },
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Всі новини / All News (News Page)')

    // About Page
    const aboutPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Про нас',
        slug: 'about',
        pageType: 'text',
        status: 'published',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'Про нашу платформу',
            subtitle: 'Хто ми і чим займаємося',
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'markdownText',
            markdown: `## Наша місія\n\nМи прагнемо зробити технології доступними для всіх. Наша платформа об'єднує інноваторів, підприємців та ентузіастів технологій.\n\n### Наші цінності\n\n- **Інновації** - ми постійно шукаємо нові рішення\n- **Якість** - ми не йдемо на компроміси\n- **Спільнота** - ми віримо в силу співпраці\n- **Освіта** - ми ділимось знаннями\n\n## Наша команда\n\nКоманда професіоналів з багаторічним досвідом у сфері технологій, бізнесу та освіти.\n\n### Контакти\n\nЗв'яжіться з нами:\n- Email: info@example.com\n- Телефон: +380 44 123 4567`,
            accentColor: 'indigo',
          },
          {
            blockType: 'callToAction',
            heading: 'Приєднуйтесь до нас',
            description: 'Станьте частиною інноваційної спільноти',
            link: {
              label: 'Зв\'язатись',
              url: '#contact',
              openInNewTab: false,
            },
          },
        ],
        seo: {
          metaTitle: 'Про нас - Інноваційна платформа',
          metaDescription: 'Дізнайтесь більше про нашу платформу, місію, команду та цінності.',
          focusKeyword: 'про платформу',
          noIndex: false,
        },
      },
      locale: 'uk',
    })

    await payload.update({
      collection: 'pages',
      id: aboutPage.id,
      data: {
        title: 'About Us',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'About Our Platform',
            subtitle: 'Who we are and what we do',
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'markdownText',
            markdown: `## Our Mission\n\nWe strive to make technology accessible to everyone. Our platform unites innovators, entrepreneurs, and technology enthusiasts.\n\n### Our Values\n\n- **Innovation** - we constantly seek new solutions\n- **Quality** - we don't compromise\n- **Community** - we believe in the power of collaboration\n- **Education** - we share knowledge\n\n## Our Team\n\nTeam of professionals with years of experience in technology, business, and education.\n\n### Contact\n\nGet in touch:\n- Email: info@example.com\n- Phone: +380 44 123 4567`,
            accentColor: 'indigo',
          },
          {
            blockType: 'callToAction',
            heading: 'Join Us',
            description: 'Become part of the innovation community',
            link: {
              label: 'Contact',
              url: '#contact',
              openInNewTab: false,
            },
          },
        ],
        seo: {
          metaTitle: 'About Us - Innovation Platform',
          metaDescription: 'Learn more about our platform, mission, team, and values.',
          focusKeyword: 'about platform',
        },
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Про нас / About Us')

    // Category pages for each tag
    const categoryPages: any[] = []

    for (let i = 0; i < 4; i++) { // Create pages for first 4 tags
      const tag = createdTags[i]
      const tagData = tags[i]
      if (!tag || !tagData) continue

      const tagName = { uk: tagData.name.uk, en: tagData.name.en }

      const categoryPage = await payload.create({
        collection: 'pages',
        data: {
          title: `Новини: ${tagName.uk}`,
          slug: `news-${tagData.slug}`,
          pageType: 'news',
          status: 'published',
          blocks: [
            {
              blockType: 'sectionHeader',
              type: 'small',
              title: tagName.uk,
              subtitle: `Новини категорії "${tagName.uk}"`,
              badge: {
                text: tagName.uk,
                icon: 'Tag',
                gradient: 'indigo-to-purple',
              },
              headingLevel: 'h1',
              enableAnimation: true,
            },
            {
              blockType: 'newsBlock',
              displayMode: 'list',
              contentSource: 'byTag',
              selectedTag: tag.id,
              enableSearch: true,
              enableFilters: false,
              enablePagination: true,
              itemsPerPage: 9,
            },
          ],
          seo: {
            metaTitle: `${tagName.uk} - Новини`,
            metaDescription: `Всі новини категорії ${tagName.uk}`,
            focusKeyword: tagName.uk.toLowerCase(),
            noIndex: false,
          },
        },
        locale: 'uk',
      })

      await payload.update({
        collection: 'pages',
        id: categoryPage.id,
        data: {
          title: `News: ${tagName.en}`,
          blocks: [
            {
              blockType: 'sectionHeader',
              type: 'small',
              title: tagName.en,
              subtitle: `News in category "${tagName.en}"`,
              badge: {
                text: tagName.en,
                icon: 'Tag',
                gradient: 'indigo-to-purple',
              },
              headingLevel: 'h1',
              enableAnimation: true,
            },
            {
              blockType: 'newsBlock',
              displayMode: 'list',
              contentSource: 'byTag',
              selectedTag: tag.id,
              enableSearch: true,
              enableFilters: false,
              enablePagination: true,
              itemsPerPage: 9,
            },
          ],
          seo: {
            metaTitle: `${tagName.en} - News`,
            metaDescription: `All news in ${tagName.en} category`,
            focusKeyword: tagName.en.toLowerCase(),
          },
        },
        locale: 'en',
      })

      categoryPages.push(categoryPage)
      console.log(`  ✓ Created: ${tagName.uk} / ${tagName.en} (Category Page)`)
    }

    // Mixed content demo page
    const demoPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Демо сторінка',
        slug: 'demo',
        pageType: 'text',
        status: 'published',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'Демонстрація можливостей',
            subtitle: 'Всі типи блоків на одній сторінці',
            badge: {
              text: 'Демо',
              icon: 'Code',
              gradient: 'purple-to-pink',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'markdownText',
            markdown: `## Markdown блок\n\nЦе приклад markdown контенту з **жирним текстом**, *курсивом* та [посиланнями](#).\n\n### Список\n\n- Пункт 1\n- Пункт 2\n- Пункт 3`,
            accentColor: 'blue',
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'Новини у режимі каруселі',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'carousel',
            contentSource: 'all',
            limit: 6,
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'Новини у режимі сітки',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'grid',
            contentSource: 'all',
            limit: 5,
          },
          {
            blockType: 'callToAction',
            heading: 'Готові розпочати?',
            description: 'Приєднуйтесь до нашої платформи вже сьогодні',
            link: {
              label: 'Розпочати',
              url: '#',
              openInNewTab: false,
            },
          },
        ],
        seo: {
          metaTitle: 'Демо сторінка - Всі можливості',
          metaDescription: 'Демонстрація всіх типів блоків та можливостей платформи',
          focusKeyword: 'демо',
          noIndex: true,
        },
      },
      locale: 'uk',
    })

    await payload.update({
      collection: 'pages',
      id: demoPage.id,
      data: {
        title: 'Demo Page',
        blocks: [
          {
            blockType: 'sectionHeader',
            type: 'big',
            title: 'Features Demonstration',
            subtitle: 'All block types on one page',
            badge: {
              text: 'Demo',
              icon: 'Code',
              gradient: 'purple-to-pink',
            },
            headingLevel: 'h1',
            enableAnimation: true,
          },
          {
            blockType: 'markdownText',
            markdown: `## Markdown Block\n\nThis is an example of markdown content with **bold text**, *italics*, and [links](#).\n\n### List\n\n- Item 1\n- Item 2\n- Item 3`,
            accentColor: 'blue',
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'News in Carousel Mode',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'carousel',
            contentSource: 'all',
            limit: 6,
          },
          {
            blockType: 'sectionHeader',
            type: 'small',
            title: 'News in Grid Mode',
            headingLevel: 'h2',
            enableAnimation: true,
          },
          {
            blockType: 'newsBlock',
            displayMode: 'grid',
            contentSource: 'all',
            limit: 5,
          },
          {
            blockType: 'callToAction',
            heading: 'Ready to Start?',
            description: 'Join our platform today',
            link: {
              label: 'Get Started',
              url: '#',
              openInNewTab: false,
            },
          },
        ],
        seo: {
          metaTitle: 'Demo Page - All Features',
          metaDescription: 'Demonstration of all block types and platform capabilities',
          focusKeyword: 'demo',
          noIndex: true,
        },
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Демо сторінка / Demo Page')

    // ============================================
    // 4. Create Navigation (Bilingual)
    // ============================================
    console.log('\n🧭 Creating Navigation (UA + EN)...')

    // Home
    const homeNav = await payload.create({
      collection: 'navigation',
      data: {
        label: 'Головна',
        linkType: 'page',
        page: homePage.id,
        order: 1,
        openInNewTab: false,
      },
      locale: 'uk',
    })
    await payload.update({
      collection: 'navigation',
      id: homeNav.id,
      data: { label: 'Home' },
      locale: 'en',
    })
    console.log('  ✓ Created: Головна / Home')

    // News with dropdown
    const newsNav = await payload.create({
      collection: 'navigation',
      data: {
        label: 'Новини',
        linkType: 'none',
        order: 2,
        openInNewTab: false,
        children: [
          {
            label: 'Категорії',
            items: [
              { label: 'Всі новини', linkType: 'page', page: newsPage.id, openInNewTab: false },
              { label: tags[0].name.uk, linkType: 'page', page: categoryPages[0].id, openInNewTab: false },
              { label: tags[1].name.uk, linkType: 'page', page: categoryPages[1].id, openInNewTab: false },
              { label: tags[2].name.uk, linkType: 'page', page: categoryPages[2].id, openInNewTab: false },
              { label: tags[3].name.uk, linkType: 'page', page: categoryPages[3].id, openInNewTab: false },
            ],
          },
        ],
      },
      locale: 'uk',
    })
    await payload.update({
      collection: 'navigation',
      id: newsNav.id,
      data: {
        label: 'News',
        children: [
          {
            label: 'Categories',
            items: [
              { label: 'All News', linkType: 'page', page: newsPage.id, openInNewTab: false },
              { label: tags[0].name.en, linkType: 'page', page: categoryPages[0].id, openInNewTab: false },
              { label: tags[1].name.en, linkType: 'page', page: categoryPages[1].id, openInNewTab: false },
              { label: tags[2].name.en, linkType: 'page', page: categoryPages[2].id, openInNewTab: false },
              { label: tags[3].name.en, linkType: 'page', page: categoryPages[3].id, openInNewTab: false },
            ],
          },
        ],
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Новини / News (with dropdown)')

    // About
    const aboutNav = await payload.create({
      collection: 'navigation',
      data: {
        label: 'Про нас',
        linkType: 'page',
        page: aboutPage.id,
        order: 3,
        openInNewTab: false,
      },
      locale: 'uk',
    })
    await payload.update({
      collection: 'navigation',
      id: aboutNav.id,
      data: { label: 'About' },
      locale: 'en',
    })
    console.log('  ✓ Created: Про нас / About')

    // Resources
    const resourcesNav = await payload.create({
      collection: 'navigation',
      data: {
        label: 'Ресурси',
        linkType: 'none',
        order: 4,
        openInNewTab: false,
        children: [
          {
            label: 'Корисне',
            items: [
              { label: 'Демо сторінка', linkType: 'page', page: demoPage.id, openInNewTab: false },
              { label: 'Документація', linkType: 'custom', href: '#docs', openInNewTab: false },
              { label: 'API', linkType: 'custom', href: '#api', openInNewTab: false },
            ],
          },
          {
            label: 'Спільнота',
            items: [
              { label: 'GitHub', linkType: 'custom', href: 'https://github.com', openInNewTab: true },
              { label: 'Discord', linkType: 'custom', href: 'https://discord.com', openInNewTab: true },
              { label: 'Twitter', linkType: 'custom', href: 'https://twitter.com', openInNewTab: true },
            ],
          },
        ],
      },
      locale: 'uk',
    })
    await payload.update({
      collection: 'navigation',
      id: resourcesNav.id,
      data: {
        label: 'Resources',
        children: [
          {
            label: 'Useful',
            items: [
              { label: 'Demo Page', linkType: 'page', page: demoPage.id, openInNewTab: false },
              { label: 'Documentation', linkType: 'custom', href: '#docs', openInNewTab: false },
              { label: 'API', linkType: 'custom', href: '#api', openInNewTab: false },
            ],
          },
          {
            label: 'Community',
            items: [
              { label: 'GitHub', linkType: 'custom', href: 'https://github.com', openInNewTab: true },
              { label: 'Discord', linkType: 'custom', href: 'https://discord.com', openInNewTab: true },
              { label: 'Twitter', linkType: 'custom', href: 'https://twitter.com', openInNewTab: true },
            ],
          },
        ],
      },
      locale: 'en',
    })
    console.log('  ✓ Created: Ресурси / Resources (with dropdown)')

    // ============================================
    // Summary
    // ============================================
    console.log('\n✅ Comprehensive demo data seeded successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - News Tags: ${createdTags.length} created (bilingual UA/EN)`)
    console.log(`   - News Articles: ${createdNewsArticles.length} created (19 published, 1 draft, bilingual UA/EN)`)
    console.log(`   - Pages: ${5 + categoryPages.length} created (bilingual UA/EN)`)
    console.log(`     • Home page`)
    console.log(`     • All News page`)
    console.log(`     • About page`)
    console.log(`     • Demo page`)
    console.log(`     • ${categoryPages.length} category pages`)
    console.log(`   - Navigation Items: 4 created (bilingual UA/EN)`)
    console.log('\n🚀 You can now view the demo content at:')
    console.log('\n   Ukrainian (UK):')
    console.log(`   - Home: http://localhost:3000/uk`)
    console.log(`   - News: http://localhost:3000/uk/news`)
    console.log(`   - About: http://localhost:3000/uk/about`)
    console.log(`   - Demo: http://localhost:3000/uk/demo`)
    console.log(`   - Categories: http://localhost:3000/uk/news-innovations (and others)`)
    console.log('\n   English (EN):')
    console.log(`   - Home: http://localhost:3000/en`)
    console.log(`   - News: http://localhost:3000/en/news`)
    console.log(`   - About: http://localhost:3000/en/about`)
    console.log(`   - Demo: http://localhost:3000/en/demo`)
    console.log(`   - Categories: http://localhost:3000/en/news-innovations (and others)`)
    console.log('\n💡 Features demonstrated:')
    console.log('   ✓ Bilingual content (Ukrainian + English)')
    console.log('   ✓ All news block display modes (list, carousel, grid)')
    console.log('   ✓ All block types (section header, markdown, CTA, news, image)')
    console.log('   ✓ Search and filtering functionality')
    console.log('   ✓ Pagination')
    console.log('   ✓ Tag filtering')
    console.log('   ✓ Draft and published statuses')
    console.log('   ✓ Multi-level navigation with dropdowns')
    console.log('   ✓ Page relationships')
    console.log('   ✓ SEO metadata')
    console.log('   ✓ Cyrillic transliteration in URLs')
    console.log('\n📝 Note: Featured images are not included.')
    console.log('   Add them manually in Payload admin for complete demo.\n')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error seeding demo data:', error)
    if (error.data?.errors) {
      console.error('Validation errors:', JSON.stringify(error.data.errors, null, 2))
    }
    process.exit(1)
  }
}

seedDemoData()
