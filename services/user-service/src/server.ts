import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { pool } from './db/connection.js'
import userRoutes from './routes/users.js'
import { createLogger } from '../../../shared/utils/logger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3004
const logger = createLogger('user-service')

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Extract session ID from headers (set by API Gateway)
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] as string
  if (sessionId) {
    req.sessionID = sessionId
  }
  next()
})

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    logger.error('Health check failed', error as Error)
    res.status(500).json({
      status: 'error',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

// Routes
app.use('/', userRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method,
    sessionId: req.sessionID
  })
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  })
})

app.listen(PORT, () => {
  logger.info(`User Service running on http://localhost:${PORT}`)
})