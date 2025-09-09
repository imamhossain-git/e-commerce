import { pool } from './db/connection.js'

async function seedDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('Seeding database...')

    // Clear existing data
    await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE')

    // Insert sample products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Smart Fitness Tracker',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking.',
        price: 149.99,
        image_url: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable organic cotton t-shirt in multiple colors.',
        price: 29.99,
        image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours.',
        price: 34.99,
        image_url: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Wireless Phone Charger',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 39.99,
        image_url: 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Premium Coffee Beans',
        description: 'Single-origin arabica coffee beans, freshly roasted to perfection.',
        price: 24.99,
        image_url: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Bamboo Desk Organizer',
        description: 'Eco-friendly bamboo desk organizer with multiple compartments.',
        price: 45.99,
        image_url: 'https://images.pexels.com/photos/6292778/pexels-photo-6292778.jpeg?auto=compress&cs=tinysrgb&w=500'
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design.',
        price: 79.99,
        image_url: 'https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=500'
      }
    ]

    for (const product of products) {
      await client.query(
        'INSERT INTO products (name, description, price, image_url) VALUES ($1, $2, $3, $4)',
        [product.name, product.description, product.price, product.image_url]
      )
    }

    console.log(`✓ Inserted ${products.length} sample products`)
    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedDatabase()