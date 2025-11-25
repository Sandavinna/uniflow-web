# ✅ Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database backup created (if needed)

## MongoDB Atlas Setup

- [ ] Account created
- [ ] Free cluster (M0) created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Connection string tested

## Backend Deployment (Render/Railway)

- [ ] Account created
- [ ] Repository connected
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (your frontend URL)
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] Backend health check passed (`/` endpoint)

## Frontend Deployment (Vercel/Netlify)

- [ ] Account created
- [ ] Repository connected
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_API_URL` (your backend URL)
- [ ] Frontend deployed successfully
- [ ] Frontend URL copied

## Post-Deployment Configuration

- [ ] CORS updated in backend with frontend URL
- [ ] Backend redeployed (if CORS changed)
- [ ] Frontend API URL verified
- [ ] Test registration
- [ ] Test login
- [ ] Test file uploads
- [ ] Test QR code generation
- [ ] Test QR code download
- [ ] Test QR code upload

## File Storage (Optional but Recommended)

- [ ] Cloudinary account created
- [ ] Cloudinary package installed
- [ ] Upload middleware updated
- [ ] Environment variables added:
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] File uploads tested

## Final Testing

- [ ] All user roles can access
- [ ] All features working
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

## Documentation

- [ ] Deployment URLs saved
- [ ] Environment variables documented
- [ ] Team members notified
- [ ] Access credentials shared (if needed)

---

## Quick Reference

### Backend Environment Variables:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend Environment Variables:
```
VITE_API_URL=https://your-backend.onrender.com
```

---

*Check off items as you complete them!*

