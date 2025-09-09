import express from 'express'
import { pool } from '../db/connection.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1')
    
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router