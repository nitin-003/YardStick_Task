# Quick Setup Guide

## 1. Create Environment Files

### Backend (.env)
Create `saas-notes-app/backend/.env`:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/yardstick-notes
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
Create `saas-notes-app/frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

## 2. Install Dependencies

### Backend
```bash
cd saas-notes-app/backend
npm install
```

### Frontend
```bash
cd saas-notes-app/frontend
npm install
```

## 3. Start MongoDB
Make sure MongoDB is running on your system.

## 4. Start the Application

### Terminal 1 - Backend
```bash
cd saas-notes-app/backend
npm start
```

### Terminal 2 - Frontend
```bash
cd saas-notes-app/frontend
npm run dev
```

## 5. Test the Application

1. Open http://localhost:5173
2. Use any of these test accounts (password: `password`):
   - admin@acme.test (Admin)
   - user@acme.test (Member)
   - admin@globex.test (Admin)
   - user@globex.test (Member)

## 6. Test API Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Login Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'
```

## Features Implemented ✅

- ✅ Multi-tenancy with strict isolation
- ✅ JWT authentication
- ✅ Role-based access (Admin/Member)
- ✅ Subscription gating (Free: 3 notes, Pro: unlimited)
- ✅ Complete Notes CRUD API
- ✅ Frontend with login, dashboard, note management
- ✅ Upgrade to Pro functionality
- ✅ Health endpoint
- ✅ CORS enabled
- ✅ All test accounts working
- ✅ Vercel deployment ready

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy both frontend and backend

The application is now ready for automated testing!
