import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items } = req.body;
    const sessionId = req.sessionID;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    await client.query('BEGIN');

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (session_id, total, status) VALUES ($1, $2, $3) RETURNING id',
      [sessionId, total, 'pending']
    );

    const orderId = orderResult.rows[0].id;

    // Create order items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE session_id = $1', [sessionId]);

    await client.query('COMMIT');

    res.json({ id: orderId, total, status: 'pending' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// GET /api/orders - Get user's orders (for future use)
router.get('/', async (req, res) => {
  try {
    const sessionId = req.sessionID;

    const result = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product_name', p.name
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.session_id = $1
      GROUP BY o.id, o.total, o.status, o.created_at
      ORDER BY o.created_at DESC
    `, [sessionId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;