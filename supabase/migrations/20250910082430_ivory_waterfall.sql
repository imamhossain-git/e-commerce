/*
  # Create products table for Product Service

  1. New Tables
    - `products`
      - `id` (serial, primary key)
      - `name` (varchar, required)
      - `description` (text, optional)
      - `price` (decimal, required, >= 0)
      - `image_url` (text, optional)
      - `stock_quantity` (integer, default 0, >= 0)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Indexes
    - Index on name for search functionality
    - Index on price for filtering

  3. Constraints
    - Price must be >= 0
    - Stock quantity must be >= 0

  4. Triggers
    - Auto-update updated_at timestamp
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();