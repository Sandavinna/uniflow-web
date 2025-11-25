# 🚀 Quick Deployment Guide - UniFlow

## Fastest Way to Deploy (Step-by-Step)

### Prerequisites:
- GitHub account
- Email for signups

---

## Step 1: MongoDB Atlas (5 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up → Create Free Cluster (M0)
3. **Database Access:**
   - Create user: `uniflow_user`
   - Password: (save this!)
   - Database User Privileges: "Read and write to any database"
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
5. **Get Connection String:**
   - Database → Connect → "Connect your application"
   - Copy: `mongodb+srv://uniflow_user:<password>@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

---

## Step 2: Deploy Backend to Render (10 minutes)

1. Push code to GitHub (if not already)
2. Go to [Render](https://render.com)
3. Sign up with GitHub
4. **New Web Service:**
   - Connect repository
   - Settings:
     - **Name:** `uniflow-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     MONGODB_URI=mongodb+srv://uniflow_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority
     JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
     PORT=5000
     NODE_ENV=production
     ```
5. Click "Create Web Service"
6. Wait for deployment (~5-10 min)
7. **Copy your backend URL:** `https://uniflow-backend.onrender.com`

---

## Step 3: Update Backend CORS

**File: `backend/server.js`**
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app' // Update after frontend deploy
  ],
  credentials: true
}));
```

Commit and push changes.

---

## Step 4: Deploy Frontend to Vercel (5 minutes)

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. **New Project:**
   - Import repository
   - Settings:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://uniflow-backend.onrender.com
     ```
4. Click "Deploy"
5. **Copy your frontend URL:** `https://your-project.vercel.app`

---

## Step 5: Update CORS with Frontend URL

1. Go back to Render dashboard
2. Update environment variable or update code:
   ```javascript
   origin: [
     'http://localhost:5173',
     'https://your-project.vercel.app' // Your actual Vercel URL
   ]
   ```
3. Redeploy backend

---

## Step 6: Test Deployment

1. Visit your Vercel URL
2. Try to register/login
3. Test features

---

## ⚠️ Important Notes

### File Uploads:
Free hosting services **delete files on restart**. For production:

**Quick Fix - Use Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com) (Free)
2. Get API keys
3. Install: `npm install cloudinary multer-storage-cloudinary`
4. Update `backend/middleware/upload.js` (see DEPLOYMENT_GUIDE.md)
5. Add env vars to Render:
   ```
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```

### Render Free Tier:
- Spins down after 15 min inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading for production

---

## 🎉 You're Live!

Your app is now accessible at:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://uniflow-backend.onrender.com`

---

## 📝 Environment Variables Summary

### Backend (Render):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel):
```
VITE_API_URL=https://uniflow-backend.onrender.com
```

---

## 🔧 Troubleshooting

**Backend not working?**
- Check Render logs
- Verify MongoDB connection string
- Check environment variables

**Frontend can't connect?**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

**Files not uploading?**
- Use Cloudinary (see above)
- Or files will be lost on restart

---

*For detailed instructions, see DEPLOYMENT_GUIDE.md*

