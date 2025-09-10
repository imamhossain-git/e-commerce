import { pool } from './db/connection.js'
import bcrypt from 'bcrypt'
import { createLogger } from '../../../shared/utils/logger.js'

const logger = createLogger('user-service-seed')

async function seedDatabase() {
  const client = await pool.connect()
  
  try {
    logger.info('Seeding user database...')

    // Clear existing data
    await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE')

    // Create sample users
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123'
      },
      {
        email: 'user@example.com',
        password: 'user123'
      },
      {
        email: 'test@example.com',
        password: 'test123'
      }
    ]

    const saltRounds = 12

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds)
      
      await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
        [user.email, passwordHash]
      )
      
      logger.info(`Created user: ${user.email}`)
    }

    logger.info(`✓ Inserted ${users.length} sample users`)
    logger.info('User database seeding completed successfully!')
    logger.info('Sample credentials:')
    users.forEach(user => {
      logger.info(`  ${user.email} / ${user.password}`)
    })
  } catch (error) {
    logger.error('Seeding failed', error as Error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedDatabase()