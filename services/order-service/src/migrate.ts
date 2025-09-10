import { pool } from './db/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createLogger } from '../../../shared/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logger = createLogger('order-service-migrate')

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    logger.info('Running order service migrations...')
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../../..', 'database', 'migrations', 'order-service')
    
    if (!fs.existsSync(migrationsDir)) {
      logger.info('No migrations directory found, creating...')
      fs.mkdirSync(migrationsDir, { recursive: true })
      return
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    for (const file of migrationFiles) {
      const version = file.replace('.sql', '')
      
      // Check if migration has already been applied
      const result = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [version]
      )

      if (result.rows.length === 0) {
        logger.info(`Applying migration: ${file}`)
        
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        )

        await client.query('BEGIN')
        await client.query(migrationSQL)
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        )
        await client.query('COMMIT')
        
        logger.info(`✓ Applied migration: ${file}`)
      } else {
        logger.info(`⏭ Skipping already applied migration: ${file}`)
      }
    }

    logger.info('Order service migrations completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('Migration failed', error as Error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()