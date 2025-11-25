# Troubleshooting Guide - White Screen Issue

If you're seeing a white screen, follow these steps:

## 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for any JavaScript errors. Common errors include:
- Import/module errors
- API connection errors
- Missing dependencies

## 2. Verify Backend is Running

The frontend requires the backend to be running. Make sure:

```bash
# Terminal 1 - Backend should be running
cd backend
npm run dev
# Should see: "Server is running on port 5000" and "MongoDB Connected"
```

## 3. Verify Frontend is Running

```bash
# Terminal 2 - Frontend should be running
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"
```

## 4. Check Dependencies

Make sure all dependencies are installed:

```bash
# In frontend directory
npm install

# In backend directory
npm install
```

## 5. Clear Browser Cache

- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or clear browser cache completely

## 6. Check MongoDB Connection

Make sure MongoDB is running:
- If using local MongoDB: `mongod` should be running
- If using MongoDB Atlas: Check your connection string in `backend/.env`

## 7. Check Environment Variables

Make sure `backend/.env` file exists and has correct values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uniflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## 8. Common Issues and Solutions

### Issue: "Cannot GET /"
**Solution**: Make sure you're accessing `http://localhost:3000` (frontend), not `http://localhost:5000` (backend)

### Issue: Network errors in console
**Solution**: 
- Check if backend is running on port 5000
- Check if CORS is enabled in backend
- Check firewall/antivirus blocking connections

### Issue: Module not found errors
**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution**: 
- Change port in `frontend/vite.config.js` (frontend)
- Change PORT in `backend/.env` (backend)

## 9. Test Basic Connection

Open browser console and run:
```javascript
fetch('http://localhost:5000/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{ message: "UniFlow API is running" }`

## 10. Still Having Issues?

1. Check the Network tab in DevTools - are API calls failing?
2. Check if there are any CORS errors
3. Verify all file paths are correct
4. Make sure you're using a modern browser (Chrome, Firefox, Edge)

## Quick Fix Commands

```bash
# Complete reset (frontend)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Complete reset (backend)
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```





