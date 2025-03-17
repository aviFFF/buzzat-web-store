# E-Commerce Platform with Strapi and Next.js

This project is a full-featured e-commerce platform with a Strapi backend for content management and a Next.js frontend for the customer-facing PWA and vendor dashboard.

## Project Structure

- `backend/` - Strapi backend for content management and API
- `frontend/` - Next.js frontend for the customer-facing PWA and vendor dashboard

## Features

### Backend (Strapi)

- Content types for products, categories, orders, user carts, and vendors
- User authentication and authorization
- RESTful API for frontend integration
- Admin panel for content management

### Frontend (Next.js)

- Progressive Web App (PWA) for mobile-first experience
- Customer-facing e-commerce store
- Vendor dashboard with order management
- Real-time notifications for new orders
- Responsive design for all devices

## Getting Started

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run develop
   ```

4. Access the Strapi admin panel at http://localhost:1337/admin

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the frontend at http://localhost:3000

## Content Types

### Category
- Name
- Icon (Media)
- Color
- Products (Relation with Product)

### Product
- Name
- Description
- MRP
- Selling Price
- Item Quantity Type
- Slug
- Image (Media)
- Categories (Relation with Category)
- Vendor (Relation with Vendor)
- Quantity Type (Enumeration)

### Order
- First Name
- Email
- Phone
- Pincode
- Address
- Total Order Value
- User ID
- Payment ID
- Order Items (Component)
- City
- Vendor (Relation with Vendor)
- Status (Enumeration)

### User Cart
- Quantity
- Amount
- Products (Relation with Product)
- User (Relation with User)
- User ID

### Vendor
- Name
- Email
- Phone
- Address
- Logo (Media)
- Products (Relation with Product)
- Orders (Relation with Order)
- User (Relation with User)

## License

This project is licensed under the MIT License. 