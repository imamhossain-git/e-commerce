import express from 'express'
import { pool } from '../db/connection.js'
import { HttpClient } from '../../../../shared/utils/http-client.js'
import { createLogger } from '../../../../shared/utils/logger.js'
import { Product } from '../../../../shared/types/index.js'

const router = express.Router()
const logger = createLogger('cart-service')
const productService = new HttpClient(process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001')

// GET /cart - Get current cart
router.get('/cart', async (req, res) => {
  try {
    const sessionId = req.sessionID
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const result = await pool.query(`
      SELECT 
        c.id,
        c.product_id,
        c.quantity,
        c.created_at,
        c.updated_at
      FROM cart_items c
      WHERE c.session_id = $1
      ORDER BY c.created_at DESC
    `, [sessionId])
    
    // Fetch product details for each cart item
    const cartItems = await Promise.all(
      result.rows.map(async (item) => {
        try {
          const product = await productService.get<Product>(`/products/${item.product_id}`)
          return {
            ...item,
            name: product.name,
            price: product.price,
            image_url: product.image_url
          }
        } catch (error) {
          logger.error('Failed to fetch product details', error as Error, { 
            productId: item.product_id,
            sessionId 
          })
          return {
            ...item,
            name: 'Product not found',
            price: 0,
            image_url: ''
          }
        }
      })
    )
    
    logger.info('Cart fetched', { sessionId, itemCount: cartItems.length })
    res.json(cartItems)
  } catch (error) {
    logger.error('Error fetching cart', error as Error, { sessionId: req.sessionID })
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// POST /cart - Add item to cart
router.post('/cart', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' })
    }

    // Verify product exists
    try {
      await productService.get<Product>(`/products/${product_id}`)
    } catch (error) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE session_id = $1 AND product_id = $2',
      [sessionId, product_id]
    )

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity
      await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      )
      
      logger.info('Cart item quantity updated', { 
        sessionId, 
        productId: product_id, 
        newQuantity 
      })
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (session_id, product_id, quantity) VALUES ($1, $2, $3)',
        [sessionId, product_id, quantity]
      )
      
      logger.info('New item added to cart', { 
        sessionId, 
        productId: product_id, 
        quantity 
      })
    }

    res.json({ success: true })
  } catch (error) {
    logger.error('Error adding to cart', error as Error, { 
      sessionId: req.sessionID,
      productId: req.body.product_id 
    })
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
})

// PUT /cart/:id - Update cart item quantity
router.put('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity } = req.body
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await pool.query(
        'DELETE FROM cart_items WHERE id = $1 AND session_id = $2',
        [id, sessionId]
      )
      
      logger.info('Cart item removed', { sessionId, cartItemId: id })
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND session_id = $3',
        [quantity, id, sessionId]
      )
      
      logger.info('Cart item quantity updated', { 
        sessionId, 
        cartItemId: id, 
        quantity 
      })
    }

    res.json({ success: true })
  } catch (error) {
    logger.error('Error updating cart item', error as Error, { 
      sessionId: req.sessionID,
      cartItemId: req.params.id 
    })
    res.status(500).json({ error: 'Failed to update cart item' })
  }
})

// DELETE /cart/:id - Remove item from cart
router.delete('/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND session_id = $2',
      [id, sessionId]
    )

    logger.info('Cart item removed', { sessionId, cartItemId: id })
    res.json({ success: true })
  } catch (error) {
    logger.error('Error removing cart item', error as Error, { 
      sessionId: req.sessionID,
      cartItemId: req.params.id 
    })
    res.status(500).json({ error: 'Failed to remove cart item' })
  }
})

// DELETE /cart - Clear entire cart
router.delete('/cart', async (req, res) => {
  try {
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const result = await pool.query(
      'DELETE FROM cart_items WHERE session_id = $1',
      [sessionId]
    )

    logger.info('Cart cleared', { sessionId, itemsRemoved: result.rowCount })
    res.json({ success: true, itemsRemoved: result.rowCount })
  } catch (error) {
    logger.error('Error clearing cart', error as Error, { sessionId: req.sessionID })
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

export default router