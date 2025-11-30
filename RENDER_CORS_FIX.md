# Render.com CORS Configuration Guide

## Problem
CORS errors when frontend (hosted on Render.com) tries to access backend API (also on Render.com).

## Solution

### 1. Backend Environment Variables (Render.com)

In your Render.com backend service, add these environment variables:

```
FRONTEND_URL=https://uniflow-web-frontend.onrender.com
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=10000
```

**How to add environment variables in Render.com:**
1. Go to your backend service dashboard
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable above

### 2. Frontend Environment Variables (Render.com)

In your Render.com frontend service, add:

```
VITE_API_URL=https://uniflow-backend2.onrender.com
```

**How to add environment variables in Render.com:**
1. Go to your frontend service dashboard
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add `VITE_API_URL` with your backend URL

### 3. Verify Backend CORS Configuration

The backend `server.js` has been updated to:
- Allow requests from `https://uniflow-web-frontend.onrender.com`
- Handle preflight OPTIONS requests properly
- Support credentials (cookies, authorization headers)

### 4. After Updating Environment Variables

1. **Redeploy both services** in Render.com:
   - Go to your service dashboard
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to trigger auto-deploy

2. **Clear browser cache** or use incognito mode to test

3. **Check browser console** for any remaining CORS errors

### 5. Testing

After deployment, test the registration endpoint:
- Open browser console
- Try registering a new user
- Should not see CORS errors

### 6. Common Issues

**Issue:** Still getting CORS errors
**Solution:** 
- Verify environment variables are set correctly
- Check that both services are deployed
- Ensure `FRONTEND_URL` in backend matches your frontend URL exactly
- Check Render.com logs for any errors

**Issue:** Backend not responding
**Solution:**
- Check MongoDB connection string is correct
- Verify PORT is set (Render.com uses PORT environment variable)
- Check Render.com service logs

### 7. Multiple Frontend URLs

If you have multiple frontend URLs (e.g., staging and production), separate them with commas:

```
FRONTEND_URL=https://uniflow-web-frontend.onrender.com,https://staging-uniflow.onrender.com
```

## Quick Checklist

- [ ] Backend `FRONTEND_URL` environment variable set
- [ ] Frontend `VITE_API_URL` environment variable set
- [ ] Both services redeployed
- [ ] Browser cache cleared
- [ ] Test registration/login endpoints

