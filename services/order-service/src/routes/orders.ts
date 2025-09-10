import express from 'express'
import { pool } from '../db/connection.js'
import { HttpClient } from '../../../../shared/utils/http-client.js'
import { createLogger } from '../../../../shared/utils/logger.js'
import { CartItem, Product } from '../../../../shared/types/index.js'

const router = express.Router()
const logger = createLogger('order-service')
const productService = new HttpClient(process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001')
const cartService = new HttpClient(process.env.CART_SERVICE_URL || 'http://localhost:3002')

// POST /orders - Create new order
router.post('/orders', async (req, res) => {
  const client = await pool.connect()
  
  try {
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    // Get cart items from cart service
    const cartItems = await cartService.get<CartItem[]>('/cart', {
      'x-session-id': sessionId
    })

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    await client.query('BEGIN')

    // Calculate total and validate products
    let total = 0
    const orderItems = []

    for (const item of cartItems) {
      try {
        const product = await productService.get<Product>(`/products/${item.product_id}`)
        const itemTotal = product.price * item.quantity
        total += itemTotal
        
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        })
      } catch (error) {
        await client.query('ROLLBACK')
        return res.status(400).json({ 
          error: `Product ${item.product_id} not found or unavailable` 
        })
      }
    }

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (session_id, total, status) VALUES ($1, $2, $3) RETURNING id, created_at',
      [sessionId, total, 'pending']
    )

    const orderId = orderResult.rows[0].id
    const createdAt = orderResult.rows[0].created_at

    // Create order items
    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      )
    }

    await client.query('COMMIT')

    // Clear cart after successful order creation
    try {
      await cartService.delete('/cart', { 'x-session-id': sessionId })
    } catch (error) {
      logger.warn('Failed to clear cart after order creation', error as Error, { 
        orderId, 
        sessionId 
      })
    }

    logger.info('Order created successfully', { 
      orderId, 
      sessionId, 
      total, 
      itemCount: orderItems.length 
    })

    res.json({ 
      id: orderId, 
      total, 
      status: 'pending',
      created_at: createdAt,
      items: orderItems
    })
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('Error creating order', error as Error, { sessionId: req.sessionID })
    res.status(500).json({ error: 'Failed to create order' })
  } finally {
    client.release()
  }
})

// GET /orders - Get user's orders
router.get('/orders', async (req, res) => {
  try {
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const result = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        o.updated_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.session_id = $1
      GROUP BY o.id, o.total, o.status, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
    `, [sessionId])

    // Fetch product details for each order item
    const ordersWithProducts = await Promise.all(
      result.rows.map(async (order) => {
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item: any) => {
            try {
              const product = await productService.get<Product>(`/products/${item.product_id}`)
              return {
                ...item,
                product_name: product.name,
                product_image: product.image_url
              }
            } catch (error) {
              logger.error('Failed to fetch product details for order item', error as Error, { 
                productId: item.product_id,
                orderId: order.id 
              })
              return {
                ...item,
                product_name: 'Product not found',
                product_image: ''
              }
            }
          })
        )

        return {
          ...order,
          items: itemsWithProducts
        }
      })
    )

    logger.info('Orders fetched', { sessionId, orderCount: ordersWithProducts.length })
    res.json(ordersWithProducts)
  } catch (error) {
    logger.error('Error fetching orders', error as Error, { sessionId: req.sessionID })
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET /orders/:id - Get single order
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const result = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        o.updated_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 AND o.session_id = $2
      GROUP BY o.id, o.total, o.status, o.created_at, o.updated_at
    `, [id, sessionId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = result.rows[0]

    // Fetch product details for order items
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item: any) => {
        try {
          const product = await productService.get<Product>(`/products/${item.product_id}`)
          return {
            ...item,
            product_name: product.name,
            product_image: product.image_url
          }
        } catch (error) {
          logger.error('Failed to fetch product details for order item', error as Error, { 
            productId: item.product_id,
            orderId: order.id 
          })
          return {
            ...item,
            product_name: 'Product not found',
            product_image: ''
          }
        }
      })
    )

    const orderWithProducts = {
      ...order,
      items: itemsWithProducts
    }

    logger.info('Order fetched', { orderId: id, sessionId })
    res.json(orderWithProducts)
  } catch (error) {
    logger.error('Error fetching order', error as Error, { 
      orderId: req.params.id,
      sessionId: req.sessionID 
    })
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// PUT /orders/:id/status - Update order status (admin only)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const sessionId = req.sessionID

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      })
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND session_id = $3 RETURNING *',
      [status, id, sessionId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    logger.info('Order status updated', { orderId: id, status, sessionId })
    res.json(result.rows[0])
  } catch (error) {
    logger.error('Error updating order status', error as Error, { 
      orderId: req.params.id,
      sessionId: req.sessionID 
    })
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router