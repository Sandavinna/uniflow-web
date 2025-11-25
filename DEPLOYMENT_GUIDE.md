# UniFlow - Deployment Guide

## 🚀 Hosting Options Overview

### Recommended Free/Cheap Options for Students:

1. **Vercel** (Frontend) + **Render** (Backend) + **MongoDB Atlas** (Database) - **FREE**
2. **Netlify** (Frontend) + **Railway** (Backend) + **MongoDB Atlas** (Database) - **FREE**
3. **Vercel** (Full-stack) + **MongoDB Atlas** - **FREE** (if using Vercel Serverless Functions)

### Paid Options (Production):
- **AWS** (EC2, S3, RDS)
- **DigitalOcean** (Droplets)
- **Heroku** (Paid plans)
- **Azure** / **Google Cloud**

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables documented
- [ ] Database connection string ready
- [ ] Frontend API URLs updated
- [ ] File upload directories configured
- [ ] CORS settings updated
- [ ] Build scripts tested locally

---

## 🎯 Option 1: Vercel (Frontend) + Render (Backend) + MongoDB Atlas (FREE)

### Step 1: Deploy MongoDB Database (MongoDB Atlas)

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create a Free Cluster** (M0 - Free tier)
3. **Create Database User:**
   - Go to "Database Access"
   - Add new user (username/password)
   - Save credentials securely
4. **Whitelist IP Address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority`

### Step 2: Deploy Backend to Render

1. **Sign up** at [Render](https://render.com) (Free tier available)

2. **Prepare Backend:**
   - Push your code to GitHub (if not already)
   - Make sure `backend/package.json` has a `start` script

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository
   - Configure:
     - **Name:** `uniflow-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Add Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=production
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://uniflow-backend.onrender.com`

### Step 3: Deploy Frontend to Vercel

1. **Sign up** at [Vercel](https://vercel.com) (Free tier)

2. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm install -g vercel
   ```

3. **Prepare Frontend:**
   - Update API base URL in frontend
   - Create `vercel.json` configuration (if needed)

4. **Deploy via Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://uniflow-backend.onrender.com
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment
   - Your site will be live at: `https://your-project.vercel.app`

### Step 4: Update Frontend API Configuration

Update your frontend to use the production API URL:

**Option A: Using Environment Variables**
- Create `.env.production` in `frontend/`:
  ```
  VITE_API_URL=https://uniflow-backend.onrender.com
  ```

**Option B: Update axios base URL**
- In your frontend code, update axios configuration:
  ```javascript
  // frontend/src/utils/axios.js or similar
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://uniflow-backend.onrender.com';
  ```

---

## 🎯 Option 2: Netlify (Frontend) + Railway (Backend) + MongoDB Atlas

### Backend on Railway:

1. **Sign up** at [Railway](https://railway.app) (Free tier with $5 credit)

2. **Deploy:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `backend`
   - Railway auto-detects Node.js
   - Add environment variables (same as Render)
   - Deploy

3. **Get URL:** Railway provides a URL like `https://your-app.railway.app`

### Frontend on Netlify:

1. **Sign up** at [Netlify](https://netlify.com)

2. **Deploy:**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Configure:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://your-app.railway.app
     ```
   - Deploy

---

## 🔧 Important Configuration Updates

### 1. Update CORS in Backend

**File: `backend/server.js`**
```javascript
// Update CORS to allow your frontend domain
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://your-project.vercel.app', // Production frontend
    'https://your-project.netlify.app' // Alternative frontend
  ],
  credentials: true
}));
```

### 2. Update Frontend API Calls

**File: `frontend/src/utils/api.js` or similar**
```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### 3. File Upload Storage

**Important:** Free hosting services have ephemeral file systems. Files uploaded will be lost on restart.

**Solutions:**

**Option A: Use Cloud Storage (Recommended)**
- **Cloudinary** (Free tier: 25GB storage)
- **AWS S3** (Pay as you go)
- **Google Cloud Storage**

**Option B: Use Database for Small Files**
- Store images as base64 in MongoDB (not recommended for large files)

**Option C: External File Hosting**
- Use services like Imgur, ImgBB for images

### 4. Environment Variables Template

**Backend `.env` (for reference):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=production

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=UniFlow
```

**Frontend `.env.production`:**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 📁 File Upload Configuration for Production

### Using Cloudinary (Recommended):

1. **Sign up** at [Cloudinary](https://cloudinary.com) (Free tier)

2. **Install Cloudinary:**
   ```bash
   cd backend
   npm install cloudinary multer-storage-cloudinary
   ```

3. **Update Upload Middleware:**
   ```javascript
   // backend/middleware/upload.js
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'uniflow',
       allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
     },
   });

   const upload = multer({ storage: storage });
   ```

4. **Add Environment Variables:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## 🗄️ Database Migration

### Export Local Data (if needed):

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/uniflow" --out=./backup

# Import to MongoDB Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/uniflow" ./backup/uniflow
```

---

## 🔍 Testing After Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.onrender.com/
   # Should return: {"message":"UniFlow API is running"}
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try logging in
   - Test file uploads
   - Test QR code generation

3. **Check Logs:**
   - Render: Dashboard → Your Service → Logs
   - Vercel: Dashboard → Your Project → Deployments → View Function Logs

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Update CORS settings in backend to include frontend URL

### Issue 2: Environment Variables Not Working
**Solution:** 
- Restart the service after adding env vars
- Check variable names (case-sensitive)
- For Vite, prefix with `VITE_`

### Issue 3: File Uploads Not Working
**Solution:** 
- Use cloud storage (Cloudinary) instead of local filesystem
- Free hosting services have ephemeral storage

### Issue 4: Build Fails
**Solution:**
- Check build logs
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

### Issue 5: Database Connection Fails
**Solution:**
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

---

## 📊 Monitoring & Maintenance

### Free Monitoring Tools:
- **UptimeRobot** - Monitor uptime (free tier: 50 monitors)
- **Sentry** - Error tracking (free tier available)

### Logs:
- **Render:** Built-in logs in dashboard
- **Vercel:** Function logs in dashboard
- **Railway:** Logs tab in dashboard

---

## 💰 Cost Estimation (Free Tier)

- **MongoDB Atlas:** FREE (512MB storage)
- **Render:** FREE (spins down after 15 min inactivity)
- **Vercel:** FREE (100GB bandwidth/month)
- **Netlify:** FREE (100GB bandwidth/month)
- **Railway:** $5 free credit/month

**Total: $0/month** (with free tiers)

---

## 🚀 Quick Start Commands

### Local Testing Before Deployment:

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run build
npm run preview
```

### Deployment Checklist:

- [ ] Push code to GitHub
- [ ] Set up MongoDB Atlas
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Update CORS settings
- [ ] Configure environment variables
- [ ] Test all features
- [ ] Set up file storage (Cloudinary)
- [ ] Test file uploads
- [ ] Monitor logs

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)

---

## 🆘 Need Help?

1. Check service-specific documentation
2. Review deployment logs
3. Test locally first
4. Check environment variables
5. Verify database connection

---

*Last Updated: 2024*
*Project: UniFlow Student Management System*

