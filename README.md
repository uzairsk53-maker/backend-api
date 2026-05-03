# Shop Credit App Backend

A comprehensive credit management system for shopkeepers built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **User Management**: Admin and Shopkeeper roles with JWT authentication
- **Product Management**: CRUD operations for products with categories
- **Order Management**: Place orders with credit/cash payment options
- **Credit System**: Credit scoring, points system, and repayment tracking
- **Real-time Notifications**: WebSocket integration for order updates
- **Admin Dashboard**: Complete admin panel for managing the system
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io
- **Caching**: Redis
- **Validation**: Joi
- **Logging**: Winston
- **Background Jobs**: BullMQ

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/shop_credit_app"
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   # This will create tables and generate Prisma client
   npm run setup
   ```

5. **Optional: Migrate from MongoDB**
   ```bash
   # If you have existing MongoDB data
   npm run migrate
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: `ShopCredit-Postman.json`

## 🗄 Database Schema

The application uses the following main entities:

- **Users**: Authentication and roles
- **Shopkeepers**: Extended user profile with credit info
- **Products**: Items available for ordering
- **Orders**: Customer orders with payment tracking
- **OrderItems**: Individual items in orders
- **CreditTransactions**: Credit usage and repayment history
- **RepaymentHistory**: Detailed repayment records

## 🔄 Migration from MongoDB

This backend has been migrated from MongoDB + Mongoose to PostgreSQL + Prisma ORM. Key changes:

### What Changed
- **ORM**: Mongoose → Prisma
- **Database**: MongoDB → PostgreSQL
- **Queries**: MongoDB syntax → Prisma syntax
- **Relations**: Manual population → Prisma includes

### What Stayed the Same
- **API Endpoints**: All routes remain identical
- **Request/Response Format**: No changes to JSON structure
- **Authentication**: JWT system unchanged
- **Business Logic**: Core functionality preserved

### Migration Steps
1. ✅ Schema converted to Prisma
2. ✅ Repositories updated to use Prisma
3. ✅ Services updated for Prisma queries
4. ✅ Migration script provided
5. ✅ Environment variables updated

## 🧪 Testing

### API Testing
1. Import `ShopCredit-Postman.json` into Postman
2. Start the server
3. Run the collection tests

### Manual Testing
```bash
# Health check
curl http://localhost:5000/

# API base
curl http://localhost:5000/api/v1/auth/login
```

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Database, Redis, Logger configs
│   ├── controllers/           # Route handlers
│   ├── middlewares/           # Auth, validation middlewares
│   ├── migrations/            # Data migration scripts
│   ├── models/                # (Removed - now using Prisma)
│   ├── repositories/          # Data access layer
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── utils/                 # Helpers, DTOs, events
│   ├── validators/            # Request validation
│   └── workers/               # Background jobs
├── .env.example               # Environment template
├── server.js                  # Application entry point
└── setup.js                   # Database setup script
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | 5000 |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
- Check the API documentation
- Review the Postman collection
- Check server logs for errors