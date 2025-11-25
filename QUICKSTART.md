# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher) installed
- MongoDB running locally or MongoDB Atlas account

## Installation Steps

### 1. Install Dependencies

From the root directory, run:
```bash
npm run install:all
```

Or install separately:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create `.env` file:
```bash
# On Windows (PowerShell)
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

3. Edit `.env` file and update:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uniflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Start the Application

#### Option 1: Run Both Servers Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Use Root Scripts

From the root directory:
```bash
# Start backend (in one terminal)
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Time Setup

1. **Register an Account:**
   - Go to http://localhost:3000/register
   - Choose your role (Admin, Student, or Lecturer)
   - Fill in the required information
   - Click Register

2. **Login:**
   - Go to http://localhost:3000/login
   - Enter your email and password
   - You'll be redirected to your role-specific dashboard

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally, or
- Update `MONGODB_URI` in `.env` with your MongoDB Atlas connection string

### Port Already in Use
- Backend: Change `PORT` in `.env` file
- Frontend: Update `vite.config.js` server port

### Module Not Found Errors
- Make sure you've run `npm install` in both `backend` and `frontend` directories
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### CORS Errors
- Make sure backend is running on port 5000
- Check that frontend proxy is configured correctly in `vite.config.js`

## Production Build

To build for production:

```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/dist/
```

## Need Help?

Check the main README.md for detailed documentation and API endpoints.





