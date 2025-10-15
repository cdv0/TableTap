# TableTap - Food Ordering App

A modern React-based food ordering application that serves both customers and restaurants with a modular, feature-based architecture.

## 🏗️ Project Structure

```
src/
├── customer/           # Customer-facing features
│   ├── components/     # Customer components (MenuItem, Cart, etc.)
│   ├── pages/         # Customer pages (OrderPage, CartPage, etc.)
│   ├── services/      # Customer-specific API calls
│   ├── styles/        # Customer-specific styles
│   └── utils/         # Customer-specific utilities
├── restaurant/        # Restaurant/Employee features
│   ├── components/    # Restaurant components (OrderList, TableGrid, etc.)
│   ├── pages/         # Restaurant pages (AdminDashboard, Tables, etc.)
│   ├── services/      # Restaurant-specific API calls
│   ├── styles/        # Restaurant-specific styles
│   └── utils/         # Restaurant-specific utilities
├── shared/            # Shared code used by both
│   ├── components/    # Shared components (Button, Header, etc.)
│   ├── services/      # Shared services (authService, etc.)
│   ├── utils/         # Shared utilities
│   ├── styles/        # Global styles
│   ├── contexts/      # React contexts (authContext)
│   ├── hooks/         # Custom hooks
│   └── types/         # TypeScript type definitions
├── assets/            # Static assets
│   ├── customer/      # Customer-specific assets
│   └── restaurant/    # Restaurant-specific assets
└── routes/            # Route definitions
    ├── customerRoutes.tsx
    ├── restaurantRoutes.tsx
    └── sharedRoutes.tsx
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

## 🛣️ Routing Structure

The application uses a modular routing approach:

### Customer Routes (`/customer/*`)
- `/order/:tableId` - Customer menu browsing
- `/order/:tableId/cart` - Shopping cart
- `/order/:tableId/orders` - Order history

### Restaurant Routes (`/restaurant/*`)
- `/admin-dashboard` - Admin dashboard
- `/employee-dashboard` - Employee dashboard
- `/tables` - Table management
- `/tables/:tableId/orders` - Order management
- `/catalog` - Menu catalog management
- `/assets` - Asset management
- `/admin-dashboard/requests` - Admin requests

### Shared Routes
- `/` - Login page
- `/signup` - Registration page

### Core Dependencies
- React 19.1.0
- React Router DOM 7.6.2
- TypeScript 5.8.3
- Vite 6.3.5

### UI Dependencies
- Bootstrap 5.3.6
- React Icons 5.5.0

### Backend Dependencies
- Supabase 2.53.0

## 📝 API Documentation

The application uses Supabase for backend services. Key API endpoints:

- **Authentication**: User login/signup
- **Menu Items**: CRUD operations for menu items
- **Orders**: Order creation and management
- **Tables**: Table status and management
