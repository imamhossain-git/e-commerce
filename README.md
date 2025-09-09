# E-Commerce Full-Stack Project

A modern e-commerce application built with React, Node.js, Express, and PostgreSQL.

## 🚀 Quick Start for Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm

### 1. Clone and Install
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies  
cd backend && npm install && cd ..
```

### 2. Database Setup
```bash
# Create database (adjust username as needed)
createdb ecommerce_db

# Or using psql
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
```

### 3. Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend environment  
cp frontend/.env.example frontend/.env
# Should work with defaults for local development
```

### 4. Database Migration & Seeding
```bash
# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend (port 3001)
npm run dev:backend

# Terminal 2: Start frontend (port 5173)  
npm run dev:frontend
```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + PostgreSQL
├── database/          # SQL migrations
└── docs/              # Documentation
```

## 🛠️ Available Scripts

- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run dev:backend` - Start backend development server
- `npm run dev:frontend` - Start frontend development server

## 📚 API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - List products
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Create order

## 🔧 Troubleshooting

1. **Database connection issues**: Check PostgreSQL is running and credentials in `backend/.env`
2. **Port conflicts**: Backend uses 3001, frontend uses 5173
3. **CORS issues**: Ensure both servers are running

See `docs/setup.md` for detailed setup instructions.