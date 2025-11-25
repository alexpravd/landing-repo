import 'dotenv/config'
import { spawn, execSync } from 'child_process'
import { MongoClient } from 'mongodb'

const DB_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/payload-platform'
const MAX_RETRIES = 30
const RETRY_INTERVAL_MS = 1000

async function checkDockerRunning(): Promise<boolean> {
  try {
    execSync('docker info', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function startMongoDB(): Promise<void> {
  console.log('Starting MongoDB container...')
  try {
    execSync('docker compose up -d mongodb', { stdio: 'inherit' })
  } catch (error) {
    throw new Error('Failed to start MongoDB container. Is Docker running?')
  }
}

async function waitForMongoDB(): Promise<void> {
  console.log('Waiting for MongoDB to be ready...')

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const client = new MongoClient(DB_URI, {
        serverSelectionTimeoutMS: 1000,
        connectTimeoutMS: 1000,
      })
      await client.connect()
      await client.db().admin().ping()
      await client.close()
      console.log('MongoDB is ready!')
      return
    } catch {
      process.stdout.write('.')
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS))
    }
  }

  throw new Error(`MongoDB did not become ready after ${MAX_RETRIES} seconds`)
}

async function isDatabaseEmpty(): Promise<boolean> {
  const client = new MongoClient(DB_URI)
  try {
    await client.connect()
    const db = client.db()
    const collections = await db.listCollections().toArray()

    if (collections.some((c) => c.name === 'users')) {
      const usersCount = await db.collection('users').countDocuments()
      return usersCount === 0
    }

    return true
  } finally {
    await client.close()
  }
}

async function runSeedScripts(): Promise<void> {
  console.log('\nFirst run detected - seeding database...\n')

  console.log('Step 1/2: Creating admin user...')
  execSync('npm run create-admin', { stdio: 'inherit' })

  console.log('\nStep 2/2: Seeding demo data...')
  execSync('npm run seed', { stdio: 'inherit' })

  console.log('\nDatabase seeding complete!')
}

function startNextDev(): void {
  console.log('\nStarting Next.js development server...\n')
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  })

  nextProcess.on('close', (code) => {
    process.exit(code || 0)
  })
}

async function main(): Promise<void> {
  try {
    console.log('=== Payload Platform Docker Development ===\n')

    if (!(await checkDockerRunning())) {
      console.error('Error: Docker is not running. Please start Docker Desktop and try again.')
      process.exit(1)
    }

    await startMongoDB()
    await waitForMongoDB()

    if (await isDatabaseEmpty()) {
      await runSeedScripts()
    } else {
      console.log('Database already contains data - skipping seed.')
    }

    startNextDev()
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
