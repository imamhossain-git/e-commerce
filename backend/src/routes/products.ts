import express from 'express'
import { pool } from '../db/connection.js'

const router = express.Router()

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, image_url, created_at, updated_at 
      FROM products 
      ORDER BY created_at DESC
    `)
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, name, description, price, image_url, created_at, updated_at FROM products WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

export default router