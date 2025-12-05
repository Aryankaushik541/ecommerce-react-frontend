# Ecommerce React Frontend

Modern ecommerce frontend with creative theme, background transitions, and admin panel.

## Features
- React 18 with Hooks
- React Router for navigation
- Animated background transitions
- Admin dashboard for product/order management
- Responsive design
- API integration with Django backend
- JWT authentication

## Setup

```bash
# Clone repository
git clone https://github.com/Aryankaushik541/ecommerce-react-frontend.git
cd ecommerce-react-frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Start development server
npm start
```

## Available Scripts
- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests

## Project Structure
```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── admin/         # Admin panel components
├── services/      # API services
├── context/       # React context
├── styles/        # CSS styles
└── utils/         # Utility functions
```

## Environment Variables
```
REACT_APP_API_URL=http://localhost:8000/api
```
