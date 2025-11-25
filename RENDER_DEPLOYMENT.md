# 🚀 Deploy UniFlow to Render - Complete Guide

## Overview

This guide will help you deploy both **Frontend** and **Backend** to Render, plus set up **MongoDB Atlas** for the database.

---

## 📋 Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register))

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Update CORS Configuration

The CORS is already configured in `backend/server.js` to use environment variables. We'll set this up in Render.

---

## Step 2: Set Up MongoDB Atlas

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a Free Cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Create Database User:**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Authentication Method: "Password"
   - Username: `uniflow_user` (or your choice)
   - Password: Create a strong password (SAVE THIS!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address:**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: "Node.js", Version: "5.5 or later"
   - Copy the connection string
   - It looks like: `mongodb+srv://uniflow_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Important:** Replace `<password>` with your actual password
   - Add database name: Change `?` to `/uniflow?`
   - Final string: `mongodb+srv://uniflow_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority`

---

## Step 3: Deploy Backend to Render

1. **Sign up/Login** at [Render Dashboard](https://dashboard.render.com)

2. **Create New Web Service:**
   - Click "New +" button
   - Select "Web Service"

3. **Connect Repository:**
   - Click "Connect account" if not connected
   - Authorize Render to access your GitHub
   - Select your repository
   - Click "Connect"

4. **Configure Backend Service:**
   - **Name:** `uniflow-backend` (or your choice)
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or choose a plan)

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   MONGODB_URI=mongodb+srv://uniflow_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/uniflow?retryWrites=true&w=majority
   ```
   (Replace with your actual connection string)
   
   ```
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
   ```
   (Generate a random string, at least 32 characters)
   
   ```
   PORT=5000
   ```
   
   ```
   NODE_ENV=production
   ```
   
   ```
   FRONTEND_URL=https://your-frontend-name.onrender.com
   ```
   (We'll update this after deploying frontend - use placeholder for now)

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Render will show build logs
   - Once deployed, you'll get a URL like: `https://uniflow-backend.onrender.com`

7. **Test Backend:**
   - Visit: `https://your-backend-url.onrender.com/`
   - Should see: `{"message":"UniFlow API is running"}`

---

## Step 4: Deploy Frontend to Render

1. **Create New Static Site:**
   - In Render Dashboard, click "New +"
   - Select "Static Site"

2. **Connect Repository:**
   - Select the same GitHub repository
   - Click "Connect"

3. **Configure Frontend:**
   - **Name:** `uniflow-frontend` (or your choice)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Environment" tab and add:
   
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (Use the backend URL from Step 3)

5. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Once deployed, you'll get a URL like: `https://uniflow-frontend.onrender.com`

---

## Step 5: Update CORS and Redeploy

1. **Update Backend Environment Variable:**
   - Go to your backend service in Render
   - Go to "Environment" tab
   - Update `FRONTEND_URL` to your actual frontend URL:
     ```
     FRONTEND_URL=https://your-frontend-url.onrender.com
     ```
   - Click "Save Changes"
   - Render will automatically redeploy

2. **Wait for Redeployment:**
   - Check the "Events" tab to see deployment progress
   - Wait for "Live" status

---

## Step 6: Test Your Deployment

1. **Visit Frontend URL:**
   - Open: `https://your-frontend-url.onrender.com`
   - Should see the login page

2. **Test Features:**
   - [ ] Register a new user
   - [ ] Login
   - [ ] Navigate to different pages
   - [ ] Test file uploads (profile picture)
   - [ ] Test QR code generation
   - [ ] Test QR code download/upload

---

## ⚠️ Important Notes

### Render Free Tier Limitations:

1. **Backend (Web Service):**
   - Spins down after 15 minutes of inactivity
   - First request after spin-down takes ~30-60 seconds (cold start)
   - 750 hours/month free
   - Auto-deploys on git push

2. **Frontend (Static Site):**
   - Always available (no spin-down)
   - Unlimited bandwidth
   - Auto-deploys on git push

### File Uploads:

**IMPORTANT:** Render's file system is **ephemeral**. Files uploaded will be **deleted** when the service restarts or redeploys.

**Solution:** Use Cloudinary for file storage (see below)

---

## 📁 File Storage Setup (Cloudinary)

Since Render's file system is temporary, set up Cloudinary for persistent file storage:

### Step 1: Sign up for Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up (free tier: 25GB storage)
3. Go to Dashboard → Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Install Cloudinary

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### Step 3: Update Upload Middleware

**File: `backend/middleware/upload.js`**

Replace the entire file with:

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uniflow',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

### Step 4: Update User Controller

**File: `backend/controllers/userController.js`**

Find the `uploadProfileImage` function and update it to use Cloudinary URL:

```javascript
// After upload, the file URL will be in req.file.path
// Cloudinary automatically provides the URL
```

The file path from Cloudinary will be the full URL, so update how you save it:

```javascript
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary provides the full URL in req.file.path
    const imageUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### Step 5: Update QR Code Controller

**File: `backend/controllers/qrCodeController.js`**

Update QR code generation to use Cloudinary:

```javascript
// Instead of saving to local filesystem, upload to Cloudinary
const uploadResult = await cloudinary.uploader.upload(qrCodePath, {
  folder: 'uniflow/qrcodes',
  resource_type: 'image',
});

const qrCodeImagePath = uploadResult.secure_url;
```

### Step 6: Add Environment Variables to Render

In your backend service on Render, add:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 7: Commit and Push

```bash
git add .
git commit -m "Add Cloudinary for file storage"
git push origin main
```

Render will automatically redeploy.

---

## 🔧 Troubleshooting

### Backend Not Starting

**Check:**
- Environment variables are set correctly
- MongoDB connection string is correct
- Build logs in Render dashboard

### CORS Errors

**Solution:**
- Verify `FRONTEND_URL` environment variable in backend
- Make sure it matches your frontend URL exactly
- Redeploy backend after updating

### 404 Errors on Frontend Routes

**Solution:**
- Render Static Sites need a `_redirects` file
- Create `frontend/public/_redirects` with:
  ```
  /*    /index.html   200
  ```

### Files Not Uploading

**Solution:**
- Use Cloudinary (see above)
- Or files will be lost on restart

### Slow First Request

**Solution:**
- This is normal for Render free tier
- Backend spins down after 15 min inactivity
- First request wakes it up (takes 30-60 seconds)
- Consider upgrading to paid plan for always-on

---

## 📊 Environment Variables Summary

### Backend (Render Web Service):

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
CLOUDINARY_CLOUD_NAME=xxx (if using Cloudinary)
CLOUDINARY_API_KEY=xxx (if using Cloudinary)
CLOUDINARY_API_SECRET=xxx (if using Cloudinary)
```

### Frontend (Render Static Site):

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🎉 You're Live!

Your application is now deployed at:
- **Frontend:** `https://your-frontend.onrender.com`
- **Backend:** `https://your-backend.onrender.com`

---

## 📝 Next Steps

1. **Custom Domain (Optional):**
   - In Render, go to your service
   - Click "Settings" → "Custom Domain"
   - Add your domain

2. **Monitoring:**
   - Check Render dashboard for logs
   - Set up uptime monitoring (UptimeRobot - free)

3. **Backup:**
   - Export MongoDB data regularly
   - Keep environment variables documented

---

## 🆘 Need Help?

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Render Status:** [status.render.com](https://status.render.com)
- **Check Logs:** Render Dashboard → Your Service → Logs

---

*Last Updated: 2024*
*Project: UniFlow Student Management System*





