/*
  # Create orders and order_items tables for Order Service

  1. New Tables
    - `orders`
      - `id` (serial, primary key)
      - `session_id` (varchar, required) - for guest users
      - `user_id` (uuid, optional) - for authenticated users
      - `total` (decimal, required, >= 0)
      - `status` (varchar, default 'pending')
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)
    
    - `order_items`
      - `id` (serial, primary key)
      - `order_id` (integer, required, foreign key)
      - `product_id` (integer, required) - references product in product service
      - `quantity` (integer, required, > 0)
      - `price` (decimal, required, >= 0) - price at time of order
      - `created_at` (timestamp, default now)

  2. Indexes
    - Index on session_id for fast order retrieval
    - Index on user_id for authenticated users
    - Index on order_id for order items

  3. Constraints
    - Total must be >= 0
    - Quantity must be > 0
    - Price must be >= 0
    - Either session_id or user_id must be present

  4. Triggers
    - Auto-update updated_at timestamp on orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_id UUID,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_session_or_user CHECK (
    (session_id IS NOT NULL AND user_id IS NULL) OR 
    (session_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();