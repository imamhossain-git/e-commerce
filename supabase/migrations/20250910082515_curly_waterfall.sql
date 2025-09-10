/*
  # Create cart_items table for Cart Service

  1. New Tables
    - `cart_items`
      - `id` (serial, primary key)
      - `session_id` (varchar, required) - for guest users
      - `user_id` (uuid, optional) - for authenticated users
      - `product_id` (integer, required) - references product in product service
      - `quantity` (integer, required, > 0)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Indexes
    - Index on session_id for fast cart retrieval
    - Index on user_id for authenticated users
    - Index on product_id for product lookups

  3. Constraints
    - Quantity must be > 0
    - Either session_id or user_id must be present

  4. Triggers
    - Auto-update updated_at timestamp
*/

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_id UUID,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cart_items_session_or_user CHECK (
    (session_id IS NOT NULL AND user_id IS NULL) OR 
    (session_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();