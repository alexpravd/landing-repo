import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import readline from 'readline'

async function cleanupDatabase() {
  try {
    console.log('🧹 Database Cleanup Script\n')

    const payload = await getPayload({ config })

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        '⚠️  WARNING: This will delete ALL content (news, pages, navigation, tags).\n' +
          '   Users and media will be preserved.\n\n' +
          '   Are you sure you want to continue? (yes/no): ',
        (ans) => {
          rl.close()
          resolve(ans)
        }
      )
    })

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Cleanup cancelled.')
      process.exit(0)
    }

    console.log('\n🗑️  Starting cleanup...\n')

    // ============================================
    // 1. Delete Navigation
    // ============================================
    console.log('🧭 Deleting Navigation items...')
    const navigation = await payload.find({
      collection: 'navigation',
      limit: 1000,
    })

    let deletedCount = 0
    for (const nav of navigation.docs) {
      await payload.delete({
        collection: 'navigation',
        id: nav.id,
      })
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} navigation items`)

    // ============================================
    // 2. Delete Pages
    // ============================================
    console.log('\n📄 Deleting Pages...')
    const pages = await payload.find({
      collection: 'pages',
      limit: 1000,
    })

    deletedCount = 0
    for (const page of pages.docs) {
      await payload.delete({
        collection: 'pages',
        id: page.id,
      })
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} pages`)

    // ============================================
    // 3. Delete News Articles
    // ============================================
    console.log('\n📰 Deleting News Articles...')
    const news = await payload.find({
      collection: 'news',
      limit: 1000,
    })

    deletedCount = 0
    for (const article of news.docs) {
      await payload.delete({
        collection: 'news',
        id: article.id,
      })
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} news articles`)

    // ============================================
    // 4. Delete News Tags
    // ============================================
    console.log('\n📌 Deleting News Tags...')
    const tags = await payload.find({
      collection: 'news-tags',
      limit: 1000,
    })

    deletedCount = 0
    for (const tag of tags.docs) {
      await payload.delete({
        collection: 'news-tags',
        id: tag.id,
      })
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} news tags`)

    // ============================================
    // 5. Optional: Delete Media (commented out by default)
    // ============================================
    // Uncomment below if you want to delete media as well
    /*
    console.log('\n🖼️  Deleting Media...')
    const media = await payload.find({
      collection: 'media',
      limit: 1000,
    })

    deletedCount = 0
    for (const item of media.docs) {
      await payload.delete({
        collection: 'media',
        id: item.id,
      })
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} media items`)
    */

    // ============================================
    // Summary
    // ============================================
    console.log('\n✅ Database cleanup completed successfully!\n')
    console.log('📊 Summary:')
    console.log('   - Navigation items: deleted')
    console.log('   - Pages: deleted')
    console.log('   - News articles: deleted')
    console.log('   - News tags: deleted')
    console.log('   - Users: preserved')
    console.log('   - Media: preserved (uncomment code to delete)')
    console.log('\n💡 You can now run "npm run seed" to populate with fresh demo data.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

cleanupDatabase()
