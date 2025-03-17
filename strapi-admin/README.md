# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

# Strapi Admin Panel with SQLite Database

This is a Strapi admin panel configured to use SQLite as the database for development. PostgreSQL configuration is also available for production.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Strapi development server:

```bash
npm run develop
```

3. Access the Strapi admin panel:

Open your browser and navigate to http://localhost:1337/admin

4. Create your first admin user:

Follow the on-screen instructions to create your first administrator account.

## Pre-configured Content Types

This Strapi instance comes with the following pre-configured content types:

### 1. Category

A collection type for organizing products with the following fields:
- Name (text, required)
- Slug (UID, generated from name)
- Icon Type (media, images only)
- Products (relation to Product content type)

### 2. Product

A collection type for managing products with the following fields:
- Name (text, required)
- Description (text)
- MRP (decimal, required)
- Selling Price (decimal, required)
- Item Quantity Type (text)
- Slug (UID, generated from name)
- Image (media, images only)
- Categories (relation to Category content type)
- Vendor (relation to Vendor content type)
- Stock (enumeration: in_stock, out_of_stock, low_stock)

### 3. Vendor

A collection type for managing product vendors with the following fields:
- Name (text, required)
- Email (email, required, unique)
- Phone (text, required)
- Address (text, required)
- Pincode (text, required)
- GSTIN (text)
- FSSAI License (text)
- Password (password, private, required)
- Products (relation to Product content type)
- Orders (relation to Order content type)
- Service Pincodes (JSON, required)
- Delivery Message (text)
- Logo (media, images only)

### 4. Order

A collection type for managing customer orders with the following fields:
- First Name (text, required)
- Email (text, required)
- Phone (text, required)
- Pincode (integer, required)
- Address (text, required)
- Total Order Value (decimal, required)
- User ID (integer)
- Payment ID (text)
- Order Item List (component, repeatable)
- City (text, required)
- Vendor (relation to Vendor content type)
- Status (enumeration: pending, processing, shipped, delivered, cancelled)

### Components

#### Order Item

A component for individual items in an order with the following fields:
- Quantity (integer, required, min: 1)
- Amount (decimal, required)
- Product (relation to Product content type)

## Environment Variables

The following environment variables are configured in the `.env` file:

### For SQLite (Development)
```
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### For PostgreSQL (Production)
```
DATABASE_CLIENT=postgres
DATABASE_HOST=dpg-cus20qan91rc73dgkmmg-a.singapore-postgres.render.com
DATABASE_PORT=5432
DATABASE_NAME=buzzat_ddb
DATABASE_USERNAME=buzzat_ddb_user
DATABASE_PASSWORD=Nu5V9gXtscO8qHBA5Z1Akmh1hWGbfmUH
DATABASE_SSL=true
DATABASE_SCHEMA=public
```

## Adding More Content Types

1. Navigate to the Content-Type Builder in the admin panel
2. Click on "Create new collection type" or "Create new single type"
3. Define your fields and relationships
4. Save and publish your content type

## API Access

Once you've created content types and added content, you can access the API at:

- REST API: http://localhost:1337/api/{content-type}

Examples:
- Get all products: http://localhost:1337/api/products
- Get a specific product: http://localhost:1337/api/products/1
- Get all categories: http://localhost:1337/api/categories
- Get all vendors: http://localhost:1337/api/vendors
- Get all orders: http://localhost:1337/api/orders

## Deployment

For production deployment, make sure to:

1. Generate new secure keys for the environment variables
2. Uncomment and use the PostgreSQL configuration in the `.env` file
3. Set up proper hosting for Strapi (you can use Render for this as well)

## Documentation

For more information, refer to the [Strapi Documentation](https://docs.strapi.io).
