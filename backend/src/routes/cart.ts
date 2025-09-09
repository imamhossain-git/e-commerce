import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// GET /api/cart - Get current cart
router.get('/', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    
    const result = await pool.query(`
      SELECT 
        c.id,
        c.product_id,
        c.quantity,
        p.name,
        p.price,
        p.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.session_id = $1
      ORDER BY c.created_at DESC
    `, [sessionId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const sessionId = req.sessionID;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE session_id = $1 AND product_id = $2',
      [sessionId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Insert new item
      await pool.query(
        'INSERT INTO cart_items (session_id, product_id, quantity) VALUES ($1, $2, $3)',
        [sessionId, product_id, quantity]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const sessionId = req.sessionID;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await pool.query(
        'DELETE FROM cart_items WHERE id = $1 AND session_id = $2',
        [id, sessionId]
      );
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND session_id = $3',
        [quantity, id, sessionId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.sessionID;

    await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND session_id = $2',
      [id, sessionId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

export default router;