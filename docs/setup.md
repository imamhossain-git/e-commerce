# Local Development Setup Guide

This guide will walk you through setting up the E-Commerce application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies  
cd backend
npm install
cd ..
```

## Step 2: Database Setup

### Create Database
```bash
# Option 1: Using createdb command
createdb ecommerce_db

# Option 2: Using psql
psql -U postgres
CREATE DATABASE ecommerce_db;
\q
```

### Configure Environment Variables
```bash
# Backend configuration
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ecommerce_db
SESSION_SECRET=your-session-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

```bash
# Frontend configuration
cp frontend/.env.example frontend/.env
```

The frontend `.env` should contain:
```env
VITE_API_URL=http://localhost:3001
```

## Step 3: Database Migration and Seeding

```bash
# Run database migrations
npm run migrate

# Seed database with sample products
npm run seed
```

## Step 4: Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
Backend will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```
Frontend will start on `http://localhost:5173`

## Step 5: Access the Application

Open your browser and navigate to `http://localhost:5173`

You should see the ShopNow homepage with navigation to:
- **Home** - Landing page with features
- **Products** - Browse all products
- **Cart** - View and manage cart items

## API Testing

You can test the API endpoints directly:

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Get Products
```bash
curl http://localhost:3001/api/products
```

### Get Cart (requires session)
```bash
curl -b cookies.txt -c cookies.txt http://localhost:3001/api/cart
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running:
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Ubuntu/Debian
   sudo systemctl start postgresql
   
   # On Windows
   # Start PostgreSQL service from Services panel
   ```

2. Check database exists:
   ```bash
   psql -U postgres -l
   ```

3. Verify connection string in `backend/.env`

### Port Conflicts
- Backend uses port **3001**
- Frontend uses port **5173**
- Change ports in respective configuration files if needed

### CORS Issues
- Ensure `FRONTEND_URL` in `backend/.env` matches frontend URL
- Both servers must be running for proper communication

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Do the same for frontend and backend directories
cd frontend && rm -rf node_modules package-lock.json && npm install && cd ..
cd backend && rm -rf node_modules package-lock.json && npm install && cd ..
```

## Development Workflow

1. **Making Changes:**
   - Frontend changes auto-reload via Vite HMR
   - Backend changes auto-reload via tsx watch mode

2. **Database Changes:**
   - Create new migration files in `database/migrations/`
   - Run `npm run migrate` to apply changes

3. **Adding New Products:**
   - Modify `backend/src/seed.ts`
   - Run `npm run seed` to update database

## Project Structure

```
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript definitions
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

Once you have the basic application running, you can:

1. **Add Authentication** - Implement user registration and login
2. **Payment Integration** - Add Stripe or similar payment processing
3. **Product Management** - Create admin interface for managing products
4. **Search & Filtering** - Add product search and category filtering
5. **Order History** - Implement user order history and tracking

## Getting Help

If you encounter issues:
1. Check the console logs in both terminal windows
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all dependencies are installed correctly

For additional help, refer to the main README.md file or create an issue in the project repository.