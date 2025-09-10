import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import RedisStore from 'connect-redis'
import { createClient } from 'redis'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import { createLogger } from '../../../shared/utils/logger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const logger = createLogger('api-gateway')

// Redis client for sessions
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redisClient.on('error', (err) => {
  logger.error('Redis connection error', err)
})

await redisClient.connect()

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
})

// Middleware
app.use(helmet())
app.use(limiter)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Session middleware
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}))

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check Redis connection
    await redisClient.ping()
    
    res.json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      redis: 'connected'
    })
  } catch (error) {
    logger.error('Health check failed', error as Error)
    res.status(500).json({
      status: 'error',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      redis: 'disconnected'
    })
  }
})

// Service proxy configurations
const services = {
  products: {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: { '^/api/products': '' }
  },
  cart: {
    target: process.env.CART_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: { '^/api/cart': '' }
  },
  orders: {
    target: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: { '^/api/orders': '' }
  },
  users: {
    target: process.env.USER_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: { '^/api/users': '' }
  }
}

// Create proxy middleware for each service
Object.entries(services).forEach(([serviceName, config]) => {
  const proxyPath = `/api/${serviceName}`
  
  app.use(proxyPath, createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}`, err)
      res.status(503).json({
        error: `${serviceName} service unavailable`,
        message: 'Please try again later'
      })
    },
    onProxyReq: (proxyReq, req) => {
      // Forward session ID to services
      if (req.sessionID) {
        proxyReq.setHeader('x-session-id', req.sessionID)
      }
      
      logger.debug(`Proxying request to ${serviceName}`, {
        path: req.path,
        method: req.method,
        sessionId: req.sessionID
      })
    }
  }))
})

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  logger.info(`API Gateway running on http://localhost:${PORT}`)
  logger.info('Service routes configured:', {
    products: '/api/products -> ' + services.products.target,
    cart: '/api/cart -> ' + services.cart.target,
    orders: '/api/orders -> ' + services.orders.target,
    users: '/api/users -> ' + services.users.target
  })
})