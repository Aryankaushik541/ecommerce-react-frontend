# Deployment Guide

## Quick Start

### Backend (Django)
```bash
cd ecommerce-django-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)
```bash
cd ecommerce-react-frontend
npm install
npm start
```

## Production Deployment

### Option 1: Railway (Recommended)
1. Push both repos to GitHub
2. Connect Railway to your GitHub
3. Deploy backend: Select Django repo, Railway auto-detects
4. Deploy frontend: Select React repo, Railway auto-detects
5. Add PostgreSQL database to backend service
6. Set environment variables

### Option 2: Vercel + Railway
**Frontend (Vercel):**
- Connect GitHub repo to Vercel
- Auto-deploys on push
- Set `REACT_APP_API_URL` environment variable

**Backend (Railway):**
- Deploy Django backend on Railway
- Add PostgreSQL database
- Configure CORS for Vercel domain

### Option 3: GitHub Pages (Frontend Only)
```bash
npm run build
# Deploy build folder to GitHub Pages
```

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:pass@host/db
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Features Implemented

### Backend (Django)
✅ Product management with categories
✅ Order management system
✅ User authentication (JWT)
✅ Admin API endpoints
✅ Image upload support
✅ RESTful API with DRF
✅ Swagger API documentation

### Frontend (React)
✅ Animated background transitions
✅ Glass morphism design
✅ Responsive layout
✅ User authentication
✅ Product catalog
✅ Admin dashboard
✅ Product/Order management
✅ Protected routes

## Next Steps
1. Add payment integration (Stripe/PayPal)
2. Implement shopping cart functionality
3. Add email notifications
4. Set up CI/CD pipeline
5. Add product reviews
6. Implement search functionality
