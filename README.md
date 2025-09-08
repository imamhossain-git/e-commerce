# E-Commerce Full-Stack Project

A modern e-commerce application built with React, Node.js, Express, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL with migrations

## 📁 Project Structure

```
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── database/          # Database migrations
├── docs/              # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup
```bash
# Create database
createdb ecommerce_db

# Run migrations
npm run migrate

# Seed data
npm run seed
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

## 🛠️ Development

### Available Scripts

**Root level:**
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔗 API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - List all products
- `GET /api/cart` - Get current cart
- `POST /api/cart` - Add item to cart
- `POST /api/orders` - Create order

## 📚 Documentation

See `docs/step1.md` for detailed setup instructions and API examples.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request