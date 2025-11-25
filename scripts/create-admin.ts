import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function createAdmin() {
  try {
    console.log('Initializing Payload...')
    const payload = await getPayload({ config })

    console.log('Creating admin user...')
    const admin = await payload.create({
      collection: 'users',
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('\nYou can now login at: http://localhost:3000/admin/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()
