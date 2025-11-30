# UniFlow - Presentation Test Scenarios

> **Quick reference guide for live demonstrations**

---

## 🎯 Quick Demo Scenarios

### Scenario 1: Admin Full Workflow (5 minutes)

**Goal:** Demonstrate complete admin capabilities

1. **Login as Admin**
   - Email: `admin1@uniflow.edu`
   - Password: `Admin1@2024`

2. **Create Course**
   - Navigate: Courses → Create Course
   - Course Code: `DEMO101`
   - Course Name: `Demo Course`
   - Department: `Demo Department`
   - Click Create

3. **Create Notice**
   - Navigate: Notices → Create Notice
   - Title: `Welcome to UniFlow Demo`
   - Category: `General`
   - Priority: `High`
   - Click Create

4. **Generate QR Code**
   - Navigate: Attendance → Generate QR
   - Select: `DEMO101`
   - Duration: `60 minutes`
   - Click Generate
   - **Show:** QR code displayed and downloadable

5. **Add Hostel Room**
   - Navigate: Hostel → Add Room
   - Block: `Demo-Block`
   - Room: `101`
   - Capacity: `2`
   - Click Add

**Demo Points:**
- ✅ Role-based dashboard
- ✅ Multiple module management
- ✅ Real-time updates
- ✅ Professional UI/UX

---

### Scenario 2: Student Journey (5 minutes)

**Goal:** Show student experience end-to-end

1. **Register Student** (or Login if exists)
   - Navigate: Register
   - Role: Student
   - Name: `Demo Student`
   - Email: `student.demo@uniflow.edu`
   - Password: `Student@2024`
   - Student ID: `DEMO001`
   - Department: `Demo Department`
   - Register

2. **Enroll in Course**
   - Navigate: Courses
   - Find: `DEMO101`
   - Click: Enroll
   - **Show:** Course in "My Courses"

3. **Mark Attendance via QR**
   - Navigate: Attendance → QR Codes tab
   - **Show:** Active QR codes for enrolled courses
   - Click: Upload QR Code
   - Upload: Downloaded QR code image
   - **Show:** Success notification

4. **Place Canteen Order**
   - Navigate: Canteen
   - Browse menu
   - Click: Order on any item
   - **Show:** Order confirmation

5. **Book Medical Appointment**
   - Navigate: Medical
   - **Show:** Medical staff availability
   - Book appointment
   - **Show:** Appointment confirmation

**Demo Points:**
- ✅ Self-service enrollment
- ✅ QR code attendance tracking
- ✅ Integrated services (canteen, medical)
- ✅ User-friendly interface

---

### Scenario 3: QR Code Attendance System (3 minutes)

**Goal:** Highlight unique QR code feature

1. **Generate QR Code** (as Lecturer/Admin)
   - Login as Admin
   - Navigate: Attendance
   - Generate QR for a course
   - **Show:** QR code image

2. **Download QR Code**
   - Click Download button
   - **Show:** File downloads as PNG

3. **Scan QR Code** (as Student)
   - Login as Student
   - Navigate: Attendance → QR Codes
   - Upload downloaded QR code
   - **Show:** Automatic scanning and attendance marking

4. **View Attendance Records**
   - Check attendance records
   - **Show:** Updated attendance count

**Demo Points:**
- ✅ Innovative QR code system
- ✅ Time-limited codes (expiration)
- ✅ Automatic attendance tracking
- ✅ Mobile-friendly (can scan from phone)

---

### Scenario 4: Multi-Role Demonstration (4 minutes)

**Goal:** Show role-based access control

1. **Admin View**
   - Login as Admin
   - **Show:** Full dashboard with all modules
   - **Show:** Statistics and overview

2. **Student View**
   - Login as Student
   - **Show:** Limited navigation (no admin features)
   - **Show:** Student-specific features

3. **Role Switching**
   - Logout and login with different role
   - **Show:** Different dashboard for each role

**Demo Points:**
- ✅ Security and access control
- ✅ Role-specific dashboards
- ✅ Proper authorization

---

## 📊 Key Features to Highlight

### 1. Modern Technology Stack
- **Frontend:** React 18, Tailwind CSS, Vite
- **Backend:** Node.js, Express, MongoDB
- **Authentication:** JWT tokens
- **Real-time:** QR code scanning

### 2. Comprehensive Modules
- ✅ Course Management
- ✅ Attendance Tracking (QR Code)
- ✅ Notice Board
- ✅ Hostel Management
- ✅ Canteen Ordering
- ✅ Medical Services

### 3. User Experience
- ✅ Responsive Design
- ✅ Intuitive Navigation
- ✅ Real-time Updates
- ✅ Error Handling
- ✅ Loading States

### 4. Security Features
- ✅ Password Hashing (bcrypt)
- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ Protected Routes

---

## 🎤 Presentation Talking Points

### Introduction (30 seconds)
> "UniFlow is a comprehensive Student Management System built with modern web technologies. It provides a complete solution for managing academic activities, student services, and administrative tasks."

### Admin Demo (2 minutes)
> "As an admin, I have full access to the system. I can create courses, manage notices, generate QR codes for attendance tracking, and oversee all modules. The dashboard provides real-time statistics and overview."

### Student Demo (2 minutes)
> "Students can enroll in courses, mark attendance by scanning QR codes, place canteen orders, book medical appointments, and access all their academic information from a single dashboard."

### QR Code Feature (1 minute)
> "One of our unique features is the QR code attendance system. Lecturers generate time-limited QR codes, and students scan them to automatically mark their attendance. This eliminates manual attendance taking and reduces errors."

### Technical Highlights (1 minute)
> "The system is built with React for the frontend, providing a fast and responsive user experience. The backend uses Node.js and Express with MongoDB for data storage. We use JWT authentication for secure access control."

---

## ⚡ Quick Troubleshooting Tips

**If something doesn't work:**
1. Check both servers are running (backend + frontend)
2. Verify MongoDB is connected
3. Refresh the browser
4. Check browser console for errors
5. Use alternative admin account

**Backup Plan:**
- Have screenshots ready
- Use multiple admin accounts
- Practice the flow beforehand
- Keep demo data simple

---

## 📋 Pre-Presentation Checklist

- [ ] Both servers running (backend on port 5000, frontend on port 5173)
- [ ] MongoDB connected and running
- [ ] At least one admin account ready
- [ ] Test QR code generation works
- [ ] Test student registration works
- [ ] Browser cache cleared (or use incognito)
- [ ] Internet connection stable (if using MongoDB Atlas)
- [ ] Backup demo data prepared

---

## 🎯 Success Criteria

Your demo is successful if you show:
1. ✅ Admin can create and manage content
2. ✅ Student can enroll and use services
3. ✅ QR code attendance works end-to-end
4. ✅ Role-based access is enforced
5. ✅ System is responsive and fast

---

**Remember:** Keep it simple, focus on key features, and let the system demonstrate its value!

Good luck! 🚀

