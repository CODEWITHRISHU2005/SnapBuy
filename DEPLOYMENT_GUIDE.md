# SnapBuy Deployment Guide

## Quick Start

### Prerequisites
- Java 21
- Node.js 20+
- PostgreSQL 17+

### Local Development

1. **Start Backend:**
   ```bash
   bash start.sh
   ```
   Backend runs on: `http://localhost:8080`

2. **Start Frontend:**
   ```bash
   cd frontend && npm run dev
   ```
   Frontend runs on: `http://localhost:5000`

### Test Credentials
- **Admin User**: admin@test.com / Admin@123
- **Regular User**: test@test.com / Admin@123

## Features Available

### Customer Features
- ✅ Browse products
- ✅ Search products
- ✅ Add to cart
- ✅ User authentication

### Admin Features
- ✅ Add new products via `/admin` route
- ✅ Upload product images
- ✅ Manage product details

## API Documentation
Swagger UI available at: `http://localhost:8080/swagger-ui.html`

## Database
- Connected to Replit-managed PostgreSQL
- 5 sample products pre-loaded
- All tables created automatically

## Environment Variables Required
- `JWT_SECRET_KEY` - JWT signing key
- `OPENAI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payment processing
- `EMAIL_PASSWORD` - For email notifications

## Production Deployment
Use Replit's built-in deployment (Publish button) to deploy with auto-scaling.

## Troubleshooting

### Products not showing
- Verify backend is running: `curl http://localhost:8080/api/products`
- Check database connection in logs

### Login not working
- Ensure test users exist in database
- Check JWT_SECRET_KEY is set

### Frontend not loading
- Verify frontend dev server is running
- Check browser console for CORS issues

