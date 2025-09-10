# E-Commerce Microservices Project

A modern e-commerce application built with microservices architecture using React, Node.js, Express, and PostgreSQL.

## 🏗️ Architecture Overview

This project follows a microservices architecture with the following services:

### Frontend
- **Web App** (`frontend/`) - React + Vite + Tailwind CSS

### Backend Services
- **API Gateway** (`services/api-gateway/`) - Routes requests to appropriate services
- **Product Service** (`services/product-service/`) - Manages product catalog
- **Cart Service** (`services/cart-service/`) - Handles shopping cart operations
- **Order Service** (`services/order-service/`) - Processes orders and payments
- **User Service** (`services/user-service/`) - User authentication and profiles

### Infrastructure
- **Database** - PostgreSQL with separate schemas per service
- **Session Store** - Redis for shared session management

## 🚀 Quick Start for Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm

### 1. Clone and Install
```bash
# Install root dependencies
npm install

# Install all service dependencies
npm run install:all
```

### 2. Infrastructure Setup
```bash
# Start PostgreSQL and Redis
# PostgreSQL: brew services start postgresql (macOS)
# Redis: brew services start redis (macOS)

# Create databases
createdb ecommerce_products
createdb ecommerce_carts  
createdb ecommerce_orders
createdb ecommerce_users
```

### 3. Environment Configuration
```bash
# Copy environment files for all services
npm run setup:env

# Edit each service's .env file with your database credentials
```

### 4. Database Migration & Seeding
```bash
# Run migrations for all services
npm run migrate:all

# Seed with sample data
npm run seed:all
```

### 5. Start All Services
```bash
# Start all backend services
npm run dev:services

# In another terminal, start frontend
npm run dev:frontend
```

Visit `http://localhost:5173` to see the application.

## 📁 Project Structure

```
├── frontend/              # React + Vite + Tailwind
├── services/
│   ├── api-gateway/       # API Gateway (port 3000)
│   ├── product-service/   # Product Service (port 3001)
│   ├── cart-service/      # Cart Service (port 3002)
│   ├── order-service/     # Order Service (port 3003)
│   └── user-service/      # User Service (port 3004)
├── shared/                # Shared utilities and types
├── database/              # Database migrations per service
└── docs/                  # Documentation
```

## 🛠️ Available Scripts

### Development
- `npm run dev:services` - Start all backend services
- `npm run dev:frontend` - Start frontend development server
- `npm run dev:gateway` - Start only API gateway
- `npm run dev:products` - Start only product service
- `npm run dev:carts` - Start only cart service
- `npm run dev:orders` - Start only order service
- `npm run dev:users` - Start only user service

### Database
- `npm run migrate:all` - Run migrations for all services
- `npm run seed:all` - Seed all databases with sample data
- `npm run migrate:products` - Run product service migrations
- `npm run migrate:carts` - Run cart service migrations
- `npm run migrate:orders` - Run order service migrations
- `npm run migrate:users` - Run user service migrations

### Setup
- `npm run install:all` - Install dependencies for all services
- `npm run setup:env` - Copy environment files for all services

## 🌐 Service Endpoints

### API Gateway (Port 3000)
- `GET /health` - Overall system health
- `GET /api/products/*` - Routes to Product Service
- `GET /api/cart/*` - Routes to Cart Service  
- `GET /api/orders/*` - Routes to Order Service
- `GET /api/users/*` - Routes to User Service

### Product Service (Port 3001)
- `GET /products` - List all products
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Cart Service (Port 3002)
- `GET /cart` - Get current cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove cart item
- `DELETE /cart` - Clear cart

### Order Service (Port 3003)
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get single order
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status

### User Service (Port 3004)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

## 🔧 Service Communication

Services communicate through:
- **HTTP REST APIs** for synchronous operations
- **Shared Redis session store** for user sessions
- **Database per service** pattern for data isolation

## 🔒 Security Features

- Rate limiting on API Gateway
- CORS configuration
- Helmet security headers
- Session-based authentication
- Input validation and sanitization

## 📊 Monitoring & Health Checks

Each service provides:
- Health check endpoints
- Structured logging
- Error handling and reporting
- Performance metrics

## 🚀 Deployment

Each service can be deployed independently:
- Docker containers for each service
- Environment-specific configurations
- Database migrations per service
- Horizontal scaling capabilities

## 🔧 Troubleshooting

1. **Service connection issues**: Check that all services are running on correct ports
2. **Database connection issues**: Verify PostgreSQL is running and databases exist
3. **Redis connection issues**: Ensure Redis is running for session management
4. **CORS issues**: Verify API Gateway CORS configuration

See individual service README files for service-specific troubleshooting.

## 📚 Next Steps

1. **Add Service Discovery** - Implement service registry (Consul, Eureka)
2. **Add Message Queue** - Implement async communication (RabbitMQ, Apache Kafka)
3. **Add Monitoring** - Implement distributed tracing (Jaeger, Zipkin)
4. **Add API Documentation** - Generate OpenAPI specs for each service
5. **Add Testing** - Unit, integration, and end-to-end tests
6. **Add CI/CD** - Automated testing and deployment pipelines