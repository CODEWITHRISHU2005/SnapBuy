# SnapBuy E-Commerce Application

## Overview
SnapBuy is a full-stack e-commerce application built with Spring Boot (Backend) and React + TypeScript (Frontend). It features product management, shopping cart, order processing, Stripe payment integration, AI-powered product descriptions/images, and a chatbot.

## Architecture

### Backend (Port 8080)
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: PostgreSQL (Replit-managed at helium)
- **Authentication**: JWT-based with refresh tokens
- **Payment**: Stripe integration
- **AI Features**: OpenAI integration for product descriptions and image generation

### Frontend (Port 5000)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: Context API (Auth & Cart)
- **HTTP Client**: Axios with JWT interceptors

## Features

### Customer Features
1. **Product Browsing** ✅
   - View all 5 sample products with images
   - Search products by keyword
   - Pagination and sorting
   - Real product data from database

2. **Shopping Cart** ✅
   - Add/remove products
   - Update quantities
   - Persistent cart (localStorage)
   - Real-time total calculation

3. **Authentication** ✅
   - User registration and login
   - JWT-based authentication with automatic token refresh
   - Test accounts available
   - Magic link (OTT) authentication option

4. **Checkout & Orders**
   - Shipping address management
   - Order placement
   - Order history viewing
   - Stripe payment integration

5. **AI Chatbot**
   - Ask product-related questions
   - Get AI-powered responses

### Admin Features
1. **Product Management** ✅ (Form Created)
   - CRUD operations for products
   - Image upload
   - AI-generated product descriptions
   - AI-generated product images (via OpenAI DALL-E)
   - Accessible via /admin route

## API Endpoints

### Authentication
- `POST /api/auth/signIn` - User login ✅
- `POST /api/auth/signUp` - User registration ✅
- `POST /api/auth/refreshToken` - Refresh access token

### Products
- `GET /api/products` - Get all products ✅
- `GET /api/products/pagination&sorting` - Paginated products ✅
- `GET /api/products/{id}` - Get product by ID ✅
- `GET /api/products/{id}/image` - Get product image
- `GET /api/products/search?keyword=` - Search products ✅
- `POST /api/products` - Create product (ADMIN) ✅
- `POST /api/products/generate-description` - AI description
- `POST /api/products/generate-image` - AI image
- `DELETE /api/products/{id}` - Delete product (ADMIN)

### Orders
- `POST /api/orders/place` - Place order
- `GET /api/orders/allOrders` - Get all orders

### Payments
- `GET /api/payments/stripe` - Initiate Stripe payment

### Chat
- `GET /api/chat/ask?message=` - Chat with AI bot

### OTT (One-Time Token)
- `POST /api/ott/sent?username=` - Send magic link
- `POST /api/ott/login?token=` - Login with magic link

## Environment Variables

### Required Secrets
- `JWT_SECRET_KEY` - Secret key for JWT token signing
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `EMAIL_PASSWORD` - Password for email service (Gmail)

### Auto-configured
- `DATABASE_URL` - PostgreSQL connection string (helium database)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - DB connection params
- `JAVA_HOME` - Java installation path
- `APP_BASE_URL` - Application base URL

## Development Setup

### Prerequisites
- Java 21
- Node.js 20
- PostgreSQL 17 (Replit-managed)

### Running the Application

#### Backend
```bash
bash start.sh
```
The backend starts on http://localhost:8080

#### Frontend
```bash
cd frontend && npm run dev
```
The frontend starts on http://localhost:5000

## Database
The application uses PostgreSQL database (Replit-managed) with JPA/Hibernate for ORM. Schema is auto-generated based on entity classes.

### Sample Data
✅ **5 Products Added**:
1. Wireless Bluetooth Headphones - $199.99 (50 in stock)
2. USB-C Fast Charger 100W - $49.99 (120 in stock)
3. Mechanical Keyboard RGB - $149.99 (75 in stock)
4. 4K Webcam Pro - $129.99 (45 in stock)
5. Ergonomic Mouse Wireless - $39.99 (200 in stock)

### Test Users
- **Admin**: admin@test.com / Admin@123 (ROLE_ADMIN)
- **User**: test@test.com / Admin@123 (ROLE_USER)

### Entities
- User (renamed to app_user table)
- Product ✅
- Order
- OrderItem
- Address
- RefreshToken
- OttToken

## Project Structure

```
/
├── src/main/java/                 # Backend source code
│   └── com/CodeWithRishu/SnapBuy/
│       ├── controller/            # REST controllers
│       ├── service/               # Business logic
│       ├── repository/            # Data access
│       ├── Entity/                # JPA entities
│       ├── dto/                   # DTOs
│       ├── config/                # Configuration
│       ├── filter/                # Security filters
│       └── exception/             # Exception handlers
├── src/main/resources/
│   └── application.properties     # Backend configuration
├── frontend/                      # Frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   └── Navbar.tsx        # Updated with "Add Product" link
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.tsx      # Product listing ✅
│   │   │   ├── LoginPage.tsx     # Authentication ✅
│   │   │   ├── AdminPage.tsx     # Product creation form ✅
│   │   │   ├── CartPage.tsx      # Shopping cart
│   │   │   ├── CheckoutPage.tsx  # Checkout flow
│   │   │   └── OrdersPage.tsx    # Order history
│   │   ├── context/              # Context providers
│   │   ├── services/             # API services
│   │   └── types.ts              # TypeScript types
│   ├── vite.config.ts            # Vite configuration (port 5000, host 0.0.0.0)
│   └── tailwind.config.js        # Tailwind configuration
├── pgdata/                        # PostgreSQL data directory
└── start.sh                       # Backend startup script
```

## User Preferences
- Default backend port: 8080
- Default frontend port: 5000
- Authentication: JWT-based with refresh tokens
- Database: PostgreSQL (Replit-managed)
- AI Provider: OpenAI (GPT-4, DALL-E)
- Payment Gateway: Stripe

## Recent Changes (2025-11-23 Final Update)
✅ **Full Stack Operational with Features**:
- Added 5 sample products to database (Headphones, Charger, Keyboard, Webcam, Mouse)
- Products displaying beautifully on frontend with real data
- Admin product creation form implemented on AdminPage component
- "Add Product" button added to navbar
- Test users created: admin@test.com (ROLE_ADMIN), test@test.com (ROLE_USER)
- Backend registration fixed to handle null name/roles fields
- Login functionality verified and working
- Product pagination, search, and sorting endpoints verified
- All core API endpoints tested and working

## Verified Working Features
✅ Product Browsing - 5 real products showing on homepage
✅ API Endpoints - Products, search, pagination all tested
✅ Authentication - Login/registration working
✅ Admin Panel - Form created for adding new products
✅ Database - Connected and synchronized with frontend
✅ Responsive UI - Tailwind CSS applied beautifully

## Next Steps & Future Enhancements
- Complete product image upload functionality
- Finalize admin order management
- Add product reviews and ratings
- Implement email notifications
- Add wishlist functionality
- Optimize AI features for production

