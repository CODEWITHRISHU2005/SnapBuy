# SnapBuy E-Commerce Application

## Overview
SnapBuy is a full-stack e-commerce application built with Spring Boot (Backend) and React + TypeScript (Frontend). It features product management, shopping cart, order processing, Stripe payment integration, AI-powered product descriptions/images, and a chatbot.

## Architecture

### Backend (Port 8080)
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: PostgreSQL (local instance)
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
1. **Product Browsing**
   - View all products with images
   - Search products by keyword
   - Pagination and sorting

2. **Shopping Cart**
   - Add/remove products
   - Update quantities
   - Persistent cart (localStorage)
   - Real-time total calculation

3. **Authentication**
   - User registration and login
   - JWT-based authentication with automatic token refresh
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
1. **Product Management**
   - CRUD operations for products
   - Image upload
   - AI-generated product descriptions
   - AI-generated product images (via OpenAI DALL-E)

## API Endpoints

### Authentication
- `POST /api/auth/signIn` - User login
- `POST /api/auth/signUp` - User registration
- `POST /api/auth/refreshToken` - Refresh access token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/pagination&sorting` - Paginated products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/{id}/image` - Get product image
- `GET /api/products/search?keyword=` - Search products
- `POST /api/products` - Create product (ADMIN)
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
- `DATABASE_URL` - PostgreSQL connection string
- `PGUSER` - PostgreSQL username
- `PGDATABASE` - PostgreSQL database name
- `JAVA_HOME` - Java installation path
- `APP_BASE_URL` - Application base URL

## Development Setup

### Prerequisites
- Java 21
- Node.js 20
- PostgreSQL 17

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
The application uses a local PostgreSQL database (`snapbuy`) with JPA/Hibernate for ORM. Schema is auto-generated based on entity classes.

### Entities
- User
- Product
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
│   │   ├── pages/                # Page components
│   │   ├── context/              # Context providers
│   │   ├── services/             # API services
│   │   └── types.ts              # TypeScript types
│   ├── vite.config.ts            # Vite configuration
│   └── tailwind.config.js        # Tailwind configuration
├── pgdata/                        # PostgreSQL data directory
└── start.sh                       # Backend startup script
```

## User Preferences
- Default backend port: 8080
- Default frontend port: 5000
- Authentication: JWT-based with refresh tokens
- Database: PostgreSQL (local)
- AI Provider: OpenAI (GPT-4, DALL-E)
- Payment Gateway: Stripe

## Recent Changes (2025-11-23)
- Migrated from MySQL to PostgreSQL for better Replit compatibility
- Configured Vite dev server for Replit environment (port 5000, host 0.0.0.0)
- Set up JWT authentication with automatic token refresh
- Implemented shopping cart with localStorage persistence
- Created responsive UI with Tailwind CSS
- Added complete e-commerce flow (browse → cart → checkout → orders)

## Known Issues
- PostgreSQL table creation warnings for reserved keyword "user" (non-critical)
- Magic link (OTT) feature requires email configuration

## Future Enhancements
- Add product reviews and ratings
- Implement admin dashboard for order management
- Add product categories and filters
- Integrate more payment gateways
- Add email notifications for orders
- Implement wishlist functionality
