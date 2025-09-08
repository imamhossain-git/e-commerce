# Getting Started

This guide will walk you through setting up and running the E-Commerce application locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

## Database Setup

1. **Create Database**
   ```bash
   # Using psql
   createdb ecommerce_db
   
   # Or using PostgreSQL command line
   psql -U postgres
   CREATE DATABASE ecommerce_db;
   \q
   ```

2. **Configure Database Connection**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_db
   SESSION_SECRET=your-session-secret-key
   PORT=3001
   NODE_ENV=development
   ```

3. **Run Migrations**
   ```bash
   # From the root directory
   npm run migrate
   ```

4. **Seed Database**
   ```bash
   # From the root directory
   npm run seed
   ```

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The backend will start on `http://localhost:3001`

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:5173`

## API Documentation

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Products

#### List all products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Bluetooth Headphones",
    "description": "Premium wireless headphones with noise cancellation",
    "price": 199.99,
    "image_url": "https://example.com/image.jpg",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get single product
```http
GET /api/products/:id
```

### Cart

#### Get current cart
```http
GET /api/cart
```

**Response:**
```json
[
  {
    "id": 1,
    "quantity": 2,
    "name": "Wireless Bluetooth Headphones",
    "price": 199.99,
    "image_url": "https://example.com/image.jpg"
  }
]
```

#### Add item to cart
```http
POST /api/cart
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 1
}
```

#### Update cart item quantity
```http
PUT /api/cart/:id
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove item from cart
```http
DELETE /api/cart/:id
```

### Orders

#### Create order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 199.99
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "total": 399.98,
  "status": "pending"
}
```

#### Get user orders
```http
GET /api/orders
```

## Development Commands

### Root Level
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Frontend  
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `.env` file
3. Verify database exists: `psql -l`

### Port Conflicts
- Backend default port: 3001
- Frontend default port: 5173
- Change ports in respective `.env` files if needed

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check that both servers are running

## Project Structure

```
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript type definitions
│   │   └── utils/      # Utility functions
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── db/         # Database connection
│   │   ├── migrate.ts  # Migration runner
│   │   └── seed.ts     # Database seeder
├── database/           # Database migrations
│   └── migrations/     # SQL migration files
└── docs/               # Documentation
```

## Next Steps

1. **Authentication**: Add user registration and login
2. **Payment Processing**: Integrate with Stripe or similar
3. **Product Images**: Upload and manage product images
4. **Search & Filtering**: Add product search and category filtering
5. **Admin Panel**: Create admin interface for managing products and orders