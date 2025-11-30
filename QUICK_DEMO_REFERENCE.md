# 🚀 Quick Demo Reference - UniFlow

## ⚡ Start Servers (Do This First!)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Wait for: "Server is running on port 5000"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Wait for: "Local: http://localhost:5173/"

---

## 🔑 Login Credentials

### Admin (Pre-registered - Use these!)
| Email | Password |
|-------|----------|
| `admin1@uniflow.edu` | `Admin1@2024` |
| `admin2@uniflow.edu` | `Admin2@2024` |

### Student (Register new or use existing)
- Email: Your choice
- Password: Must have 8+ chars, uppercase, lowercase, number, special char
- Example: `Student@2024`

---

## 🎯 5-Minute Demo Flow

### Step 1: Admin Login (30 sec)
1. Go to: http://localhost:5173/login
2. Email: `admin1@uniflow.edu`
3. Password: `Admin1@2024`
4. ✅ See Admin Dashboard

### Step 2: Create Course (1 min)
1. Click: **Courses** in sidebar
2. Click: **Create Course** button
3. Fill:
   - Course Code: `CS101`
   - Course Name: `Demo Course`
   - Department: `Computer Science`
   - Credits: `3`
4. Click: **Create**
5. ✅ Course created

### Step 3: Generate QR Code (1 min)
1. Click: **Attendance** in sidebar
2. Click: **Generate QR** button
3. Select: Course (CS101)
4. Duration: `60` minutes
5. Click: **Generate QR Code**
6. ✅ QR code displayed - Click **Download**

### Step 4: Register Student (1 min)
1. Logout (top right)
2. Click: **Register**
3. Role: **Student**
4. Fill in details:
   - Name: `John Student`
   - Email: `student@demo.com`
   - Password: `Student@2024`
   - Student ID: `STU001`
   - Department: `Computer Science`
   - Year: `Year 1`
5. Click: **Register**
6. ✅ Auto-logged in as student

### Step 5: Student Features (2 min)
1. **Enroll in Course:**
   - Click: **Courses**
   - Find: `CS101`
   - Click: **Enroll**
   - ✅ Enrolled!

2. **Mark Attendance:**
   - Click: **Attendance**
   - Tab: **QR Codes**
   - Click: **Upload QR Code**
   - Select: Downloaded QR code image
   - ✅ Attendance marked!

3. **Place Order:**
   - Click: **Canteen**
   - Click: **Order** on any item
   - ✅ Order placed!

---

## 🎤 What to Say During Demo

### Opening (30 sec)
> "UniFlow is a comprehensive Student Management System. Let me show you how it works by logging in as an admin."

### Admin Features (1 min)
> "As an admin, I can create courses, manage notices, and generate QR codes for attendance tracking. Let me create a course and generate a QR code."

### Student Experience (2 min)
> "Now let me show you the student experience. Students can enroll in courses, scan QR codes to mark attendance automatically, and use various services like the canteen ordering system."

### Key Highlight (1 min)
> "The QR code attendance system is one of our unique features. Lecturers generate time-limited QR codes, and students scan them using their phones to automatically mark attendance. This eliminates manual processes and reduces errors."

### Close (30 sec)
> "The system is built with React, Node.js, and MongoDB, providing a modern, scalable, and secure platform for managing educational institutions."

---

## ✅ Quick Checklist Before Demo

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] MongoDB connected
- [ ] Browser open to http://localhost:5173
- [ ] Admin credentials ready
- [ ] QR code feature tested
- [ ] Internet stable (if using MongoDB Atlas)

---

## 🆘 If Something Goes Wrong

**Backend not starting?**
- Check MongoDB is running
- Check `.env` file exists
- Try: `cd backend && npm install`

**Frontend not loading?**
- Check port 5173 is free
- Try: `cd frontend && npm install`
- Clear browser cache

**Can't login?**
- Verify credentials exactly: `admin1@uniflow.edu` / `Admin1@2024`
- Check backend is running
- Try another admin account

**QR code not working?**
- Make sure course exists
- Make sure student is enrolled
- Try downloading and re-uploading QR code

---

## 📱 Quick Feature Access

| Feature | Navigation Path |
|---------|----------------|
| Courses | Sidebar → Courses |
| Attendance | Sidebar → Attendance |
| QR Codes | Attendance → QR Codes tab |
| Notices | Sidebar → Notices |
| Hostel | Sidebar → Hostel |
| Canteen | Sidebar → Canteen |
| Medical | Sidebar → Medical |
| Profile | Top right → Profile |

---

## 🎯 Key Points to Emphasize

1. **✅ Modern Tech Stack** - React, Node.js, MongoDB
2. **✅ QR Code Innovation** - Automatic attendance tracking
3. **✅ Role-Based Access** - Secure, organized permissions
4. **✅ Comprehensive Modules** - All-in-one solution
5. **✅ User-Friendly** - Intuitive interface, responsive design

---

**🎉 You're Ready! Good luck with your presentation!**

