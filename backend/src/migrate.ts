import { pool } from './db/connection.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    console.log('Running database migrations...')
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../..', 'database', 'migrations')
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
        console.log(`Applying migration: ${file}`)
        
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
        
        console.log(`✓ Applied migration: ${file}`)
      } else {
        console.log(`⏭ Skipping already applied migration: ${file}`)
      }
    }

    console.log('All migrations completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()