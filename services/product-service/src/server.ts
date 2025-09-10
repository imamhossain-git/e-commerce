import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { pool } from './db/connection.js'
import productRoutes from './routes/products.js'
import { createLogger } from '../../../shared/utils/logger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const logger = createLogger('product-service')

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'product-service',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    logger.error('Health check failed', error as Error)
    res.status(500).json({
      status: 'error',
      service: 'product-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

// Routes
app.use('/', productRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method
  })
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  })
})

app.listen(PORT, () => {
  logger.info(`Product Service running on http://localhost:${PORT}`)
})