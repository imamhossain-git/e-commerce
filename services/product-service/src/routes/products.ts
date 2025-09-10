import express from 'express'
import { pool } from '../db/connection.js'
import { createLogger } from '../../../../shared/utils/logger.js'

const router = express.Router()
const logger = createLogger('product-service')

// GET /products - List all products
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, image_url, stock_quantity, created_at, updated_at 
      FROM products 
      ORDER BY created_at DESC
    `)
    
    logger.info('Products fetched', { count: result.rows.length })
    res.json(result.rows)
  } catch (error) {
    logger.error('Error fetching products', error as Error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /products/:id - Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT id, name, description, price, image_url, stock_quantity, created_at, updated_at FROM products WHERE id = $1',
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    logger.info('Product fetched', { productId: id })
    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error fetching product', error as Error, { productId: req.params.id })
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /products - Create new product (admin only)
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, image_url, stock_quantity = 0 } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' })
    }

    const result = await pool.query(
      'INSERT INTO products (name, description, price, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, image_url, stock_quantity]
    )

    logger.info('Product created', { productId: result.rows[0].id, name })
    res.status(201).json(result.rows[0])
  } catch (error) {
    logger.error('Error creating product', error as Error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /products/:id - Update product (admin only)
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, image_url, stock_quantity } = req.body

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           image_url = COALESCE($4, image_url), 
           stock_quantity = COALESCE($5, stock_quantity),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [name, description, price, image_url, stock_quantity, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    logger.info('Product updated', { productId: id })
    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error updating product', error as Error, { productId: req.params.id })
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE /products/:id - Delete product (admin only)
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    logger.info('Product deleted', { productId: id })
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    logger.error('Error deleting product', error as Error, { productId: req.params.id })
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router