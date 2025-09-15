# YardStick Notes - Multi-Tenant SaaS Application

A complete multi-tenant SaaS Notes Application built with Node.js, Express, MongoDB, React, and deployed on Vercel.

## 🏗️ Architecture

### Multi-Tenancy Approach
This application uses a **shared schema with tenant ID column** approach for multi-tenancy:

- **Database**: Single MongoDB database with tenant isolation via `tenantId` fields
- **Isolation**: Strict data isolation enforced at the application level
- **Scalability**: Easy to scale and maintain while ensuring data security

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- Joi Validation
- Bcrypt for password hashing

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Toastify for notifications

**Deployment:**
- Vercel (both frontend and backend)
- MongoDB Atlas (production database)

## 🚀 Features

### 1. Multi-Tenancy
- ✅ Support for multiple tenants (Acme Corp, Globex Inc)
- ✅ Strict data isolation between tenants
- ✅ Tenant-specific user management

### 2. Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Member)
- ✅ Secure password hashing with bcrypt

### 3. Subscription Feature Gating
- ✅ Free Plan: 3 notes maximum
- ✅ Pro Plan: Unlimited notes
- ✅ Admin-only upgrade endpoint

### 4. Notes CRUD Operations
- ✅ Create, Read, Update, Delete notes
- ✅ Archive/Unarchive functionality
- ✅ Priority levels (Low, Medium, High)
- ✅ Tags and categories
- ✅ Search and filtering

### 5. User Management
- ✅ Admin can invite users
- ✅ Member role restrictions
- ✅ Profile management

## 🔐 Test Accounts

All test accounts use password: `password`

| Email | Role | Tenant |
|-------|------|--------|
| admin@acme.test | Admin | Acme Corp |
| user@acme.test | Member | Acme Corp |
| admin@globex.test | Admin | Globex Inc |
| user@globex.test | Member | Globex Inc |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/invite` - Invite user (Admin only)
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - List notes (with pagination, filtering)
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/archive` - Archive/Unarchive note

### Tenants
- `GET /api/tenants/:slug` - Get tenant info
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro (Admin only)
- `GET /api/tenants/:slug/stats` - Get tenant statistics (Admin only)

### Health
- `GET /api/health` - Health check endpoint

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd saas-notes-app/backend
   npm install
   ```

2. **Environment setup:**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/yardstick-notes
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd saas-notes-app/frontend
   npm install
   ```

2. **Environment setup:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Database Setup

The application will automatically create seed data on first run:
- Two tenants: Acme Corp and Globex Inc
- Four test users with the credentials listed above
- All users have the password: `password`

## 🚀 Deployment

### Backend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-production-jwt-secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
3. **Deploy the backend folder**

### Frontend Deployment (Vercel)

1. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
2. **Deploy the frontend folder**

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **CORS Configuration**: Properly configured for production
- **Helmet Security**: Security headers middleware
- **Tenant Isolation**: Strict data separation
- **Role-based Access**: Admin/Member permissions

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'member']),
  tenantId: ObjectId (ref: 'Tenant'),
  isActive: Boolean,
  lastLogin: Date,
  profile: {
    firstName: String,
    lastName: String
  }
}
```

### Tenants Collection
```javascript
{
  name: String (required),
  slug: String (unique, required),
  subscription: String (enum: ['free', 'pro']),
  isActive: Boolean
}
```

### Notes Collection
```javascript
{
  title: String (required),
  content: String (required),
  tags: [String],
  priority: String (enum: ['low', 'medium', 'high']),
  category: String,
  isArchived: Boolean,
  tenantId: ObjectId (ref: 'Tenant'),
  createdBy: ObjectId (ref: 'User')
}
```

## 🧪 Testing

The application is designed to work with automated test scripts that verify:

- ✅ Health endpoint availability
- ✅ Successful login for all predefined accounts
- ✅ Enforcement of tenant isolation
- ✅ Role-based restrictions
- ✅ Free plan note limit enforcement
- ✅ Pro plan upgrade functionality
- ✅ All CRUD endpoints functionality
- ✅ Frontend accessibility

## 📝 API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error details"]
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend URL for CORS

**Frontend (.env):**
- `VITE_API_URL`: Backend API URL

## 📈 Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading
- **Caching**: JWT token caching
- **Error Handling**: Comprehensive error management
- **Validation**: Input sanitization and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for YardStick Assignment**
