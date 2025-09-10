import express from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../db/connection.js'
import { createLogger } from '../../../../shared/utils/logger.js'

const router = express.Router()
const logger = createLogger('user-service')

// POST /auth/register - User registration
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase(), passwordHash]
    )

    const user = result.rows[0]

    logger.info('User registered successfully', { userId: user.id, email })
    res.status(201).json({
      id: user.id,
      email: user.email,
      created_at: user.created_at
    })
  } catch (error) {
    logger.error('Error registering user', error as Error, { email: req.body.email })
    res.status(500).json({ error: 'Failed to register user' })
  }
})

// POST /auth/login - User login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    logger.info('User logged in successfully', { userId: user.id, email })
    res.json({
      id: user.id,
      email: user.email,
      message: 'Login successful'
    })
  } catch (error) {
    logger.error('Error logging in user', error as Error, { email: req.body.email })
    res.status(500).json({ error: 'Failed to login' })
  }
})

// POST /auth/logout - User logout
router.post('/auth/logout', (req, res) => {
  // In a session-based system, this would clear the session
  // For now, just return success
  logger.info('User logged out', { sessionId: req.sessionID })
  res.json({ message: 'Logout successful' })
})

// GET /profile - Get user profile (requires authentication)
router.get('/profile', async (req, res) => {
  try {
    // In a real implementation, you would extract user ID from JWT token
    // For now, return a placeholder response
    res.status(401).json({ error: 'Authentication required' })
  } catch (error) {
    logger.error('Error fetching profile', error as Error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PUT /profile - Update user profile (requires authentication)
router.put('/profile', async (req, res) => {
  try {
    // In a real implementation, you would extract user ID from JWT token
    // For now, return a placeholder response
    res.status(401).json({ error: 'Authentication required' })
  } catch (error) {
    logger.error('Error updating profile', error as Error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router