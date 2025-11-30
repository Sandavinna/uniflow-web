# UniFlow - Complete Testing Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [System Overview](#system-overview)
3. [Test Accounts](#test-accounts)
4. [Testing Scenarios by Role](#testing-scenarios-by-role)
5. [Feature Testing Checklist](#feature-testing-checklist)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+) installed
- MongoDB running (local or Atlas)
- Two terminal windows

### Step 1: Start Backend Server

```bash
cd backend
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
MongoDB Connected
Server is running on port 5000
```

### Step 2: Start Frontend Server

In a **new terminal window**:

```bash
cd frontend
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 3: Access Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🎯 System Overview

### Available Roles

1. **Admin** - Full system access
2. **Student** - Course enrollment, attendance tracking, orders
3. **Lecturer** - Course management, attendance marking, QR codes
4. **Medical Staff** - Medical appointments and records
5. **Canteen Staff** - Menu and order management
6. **Hostel Admin** - Room allocation and management

### Main Modules

- 📚 **Course Management**
- ✅ **Attendance System** (with QR Code)
- 📢 **Notice Board**
- 🏠 **Hostel Management**
- 🍽️ **Canteen Ordering**
- 🏥 **Medical Services**
- 👤 **User Management**

---

## 🔑 Test Accounts

### Pre-Registered Admin Accounts

| # | Email | Password | Use Case |
|---|-------|----------|----------|
| 1 | `admin1@uniflow.edu` | `Admin1@2024` | Primary testing |
| 2 | `admin2@uniflow.edu` | `Admin2@2024` | Backup account |
| 3 | `admin3@uniflow.edu` | `Admin3@2024` | Additional testing |
| 4 | `admin4@uniflow.edu` | `Admin4@2024` | Demo account |
| 5 | `admin5@uniflow.edu` | `Admin5@2024` | Spare account |

**Note:** These accounts are already registered. No need to register - just login!

---

## 🧪 Testing Scenarios by Role

### 👨‍💼 ADMIN ROLE TESTING

#### 1. Login as Admin
- **Steps:**
  1. Go to http://localhost:5173/login
  2. Enter email: `admin1@uniflow.edu`
  3. Enter password: `Admin1@2024`
  4. Click "Sign In"
  
- **Expected:** Redirected to Admin Dashboard with overview statistics

#### 2. Create a Course
- **Steps:**
  1. Click "Courses" in navigation
  2. Click "Create Course" button
  3. Fill in:
     - Course Code: `CS101`
     - Course Name: `Introduction to Computer Science`
     - Department: `Computer Science`
     - Credits: `3`
     - Select a Lecturer
  4. Click "Create Course"
  
- **Expected:** Course appears in the list immediately

#### 3. Create a Notice
- **Steps:**
  1. Navigate to "Notices"
  2. Click "Create Notice"
  3. Fill in:
     - Title: `Midterm Exam Schedule`
     - Content: `All midterm exams will be held next week...`
     - Category: `Academic`
     - Priority: `High`
  4. Click "Create Notice"
  
- **Expected:** Notice appears in the notice board

#### 4. Generate QR Code for Attendance
- **Steps:**
  1. Go to "Attendance" page
  2. Click "Generate QR" button
  3. Select a course from dropdown
  4. Set duration (default: 60 minutes)
  5. Click "Generate QR Code"
  
- **Expected:** QR code displayed and can be downloaded as PNG

#### 5. Add Hostel Room
- **Steps:**
  1. Navigate to "Hostel"
  2. Click "Add Room"
  3. Fill in:
     - Block Name: `A-Block`
     - Room Number: `101`
     - Capacity: `2`
  4. Click "Add Room"
  
- **Expected:** Room appears in the hostel list

#### 6. Add Canteen Menu Item
- **Steps:**
  1. Go to "Canteen"
  2. Click "Add Menu Item"
  3. Fill in:
     - Name: `Pizza`
     - Description: `Margherita Pizza`
     - Price: `250`
     - Category: `Lunch`
  4. Click "Add Item"
  
- **Expected:** Menu item appears in the menu list

#### 7. View User Management
- **Steps:**
  1. Check dashboard statistics
  2. View all users, courses, attendance records
  
- **Expected:** Accurate counts displayed

---

### 👨‍🎓 STUDENT ROLE TESTING

#### First: Register a Student Account

- **Steps:**
  1. Go to http://localhost:5173/register
  2. Select role: **Student**
  3. Fill in:
     - Name: `John Doe`
     - Email: `student1@uniflow.edu`
     - Password: `Student1@2024` (must meet requirements)
     - Student ID: `STU001`
     - Department: `Computer Science`
     - Academic Year: `Year 1`
  4. Click "Register"

#### 1. Login as Student
- **Steps:**
  1. Login with student credentials
  2. Should see Student Dashboard
  
- **Expected:** Student dashboard with enrolled courses (if any)

#### 2. Enroll in a Course
- **Steps:**
  1. Go to "Courses" page
  2. Find a course created by admin/lecturer
  3. Click "Enroll" button
  
- **Expected:** Course appears in "My Courses" section

#### 3. Scan QR Code for Attendance
- **Steps:**
  1. Go to "Attendance" page
  2. Click "QR Codes" tab
  3. Find an active QR code for enrolled course
  4. Download the QR code image
  5. Click "Upload QR Code"
  6. Select the downloaded image
  7. System will automatically scan and mark attendance
  
- **Expected:** Success message: "Attendance marked successfully!"

#### 4. View Attendance Records
- **Steps:**
  1. Stay on "Attendance" page
  2. Click "Records" tab
  3. View attendance history
  4. Check statistics (present/absent counts)
  
- **Expected:** Attendance data displayed with dates and status

#### 5. View Notices
- **Steps:**
  1. Navigate to "Notices"
  2. Browse all notices
  3. Filter by category if needed
  
- **Expected:** All notices visible, sorted by date

#### 6. Place Canteen Order
- **Steps:**
  1. Go to "Canteen"
  2. Browse available menu items
  3. Click "Order" on any item
  4. Confirm order
  
- **Expected:** Order placed successfully, appears in order history

#### 7. Book Medical Appointment
- **Steps:**
  1. Navigate to "Medical"
  2. Check medical staff availability
  3. Click "Book Appointment"
  4. Select date and time
  5. Add description of issue
  6. Submit
  
- **Expected:** Appointment booked, confirmation displayed

#### 8. View Hostel Room
- **Steps:**
  1. Go to "Hostel"
  2. View allocated room (if any)
  3. Check room details and block information
  
- **Expected:** Room information displayed if allocated by admin

---

### 👨‍🏫 LECTURER ROLE TESTING

#### First: Register a Lecturer Account

- **Steps:**
  1. Go to register page
  2. Select role: **Lecturer**
  3. Fill in details
  4. Register

#### 1. Create a Course
- **Steps:**
  1. Login as lecturer
  2. Go to "Courses"
  3. Create a new course
  
- **Expected:** Course created successfully

#### 2. Generate QR Code for Attendance
- **Steps:**
  1. Go to "Attendance"
  2. Generate QR code for your course
  3. Set expiration time
  4. Download QR code
  
- **Expected:** QR code generated and downloadable

#### 3. View QR Code Attendance Records
- **Steps:**
  1. After QR code is scanned by students
  2. Click "View Attendance" on the QR code
  3. See list of students who scanned
  
- **Expected:** List of students with scan timestamps

#### 4. Manually Mark Attendance
- **Steps:**
  1. Go to "Attendance"
  2. Click "Mark Attendance"
  3. Select course, student, date, status
  4. Submit
  
- **Expected:** Attendance marked manually

#### 5. Create Notice
- **Steps:**
  1. Go to "Notices"
  2. Create a notice for students
  
- **Expected:** Notice published and visible to students

---

### 🏥 MEDICAL STAFF ROLE TESTING

#### First: Register Medical Staff

- **Steps:**
  1. Register with role: **Medical Staff**
  2. Login

#### 1. View Appointments
- **Steps:**
  1. Login as medical staff
  2. View appointment dashboard
  3. See pending and completed appointments
  
- **Expected:** List of student appointments

#### 2. Update Appointment Status
- **Steps:**
  1. Select an appointment
  2. Update status (confirmed, completed)
  3. Add prescription if needed
  
- **Expected:** Status updated successfully

---

### 🍽️ CANTEEN STAFF ROLE TESTING

#### First: Register Canteen Staff

- **Steps:**
  1. Register with role: **Canteen Staff**
  2. Login

#### 1. Manage Menu
- **Steps:**
  1. Login as canteen staff
  2. Add/edit menu items
  3. Toggle availability
  
- **Expected:** Menu items managed successfully

#### 2. View and Update Orders
- **Steps:**
  1. View all orders
  2. Update order status (preparing, ready, completed)
  
- **Expected:** Orders managed efficiently

---

### 🏠 HOSTEL ADMIN ROLE TESTING

#### First: Register Hostel Admin

- **Steps:**
  1. Register with role: **Hostel Admin**
  2. Login

#### 1. Manage Hostel Rooms
- **Steps:**
  1. Add rooms and blocks
  2. Allocate rooms to students
  3. View occupancy status
  
- **Expected:** Hostel managed properly

---

## ✅ Feature Testing Checklist

### Authentication & Security
- [ ] Admin login with pre-registered account
- [ ] Student registration and login
- [ ] Lecturer registration and login
- [ ] Password validation (must meet requirements)
- [ ] JWT token authentication
- [ ] Protected routes (cannot access without login)
- [ ] Role-based access control

### Course Management
- [ ] Admin/Lecturer can create courses
- [ ] Admin/Lecturer can edit courses
- [ ] Admin can delete courses
- [ ] Students can enroll in courses
- [ ] Course list displays correctly
- [ ] Course details show properly

### Attendance System
- [ ] QR code generation works
- [ ] QR code download works
- [ ] QR code image upload and scan works
- [ ] Attendance marked after QR scan
- [ ] Manual attendance marking works
- [ ] Attendance records display correctly
- [ ] Attendance statistics calculate properly
- [ ] QR code expiration works

### Notice Board
- [ ] Admin/Lecturer can create notices
- [ ] Notices display to all users
- [ ] Notice filtering by category works
- [ ] Priority levels display correctly
- [ ] Notice deletion works

### Hostel Management
- [ ] Admin/Hostel Admin can add rooms
- [ ] Room allocation to students works
- [ ] Occupancy tracking works
- [ ] Room availability displays correctly

### Canteen System
- [ ] Menu items can be added
- [ ] Menu items can be edited
- [ ] Availability toggle works
- [ ] Students can place orders
- [ ] Order status tracking works

### Medical Services
- [ ] Students can book appointments
- [ ] Medical staff availability shown
- [ ] Appointment status updates work
- [ ] Medical records accessible

### User Interface
- [ ] Responsive design works
- [ ] Navigation menu functions
- [ ] Loading states display
- [ ] Error messages show properly
- [ ] Success notifications appear
- [ ] Dashboard statistics accurate

---

## 🎤 Presentation Demo Flow

### Suggested 10-Minute Demo:

**1. Introduction (1 min)**
- Show login page
- Mention it's a full-stack Student Management System

**2. Admin Features (3 min)**
- Login as admin
- Create a course
- Generate QR code for attendance
- Create a notice
- Show dashboard statistics

**3. Student Features (3 min)**
- Register a student account (or use existing)
- Enroll in course
- Scan QR code for attendance
- Place canteen order
- Book medical appointment

**4. Advanced Features (2 min)**
- Show attendance tracking
- Show role-based access
- Show responsive design

**5. Conclusion (1 min)**
- Show system architecture
- Mention technologies used
- Q&A

---

## 🔧 Troubleshooting

### Common Issues:

**Backend won't start:**
- Check MongoDB is running
- Verify `.env` file exists and has correct MONGODB_URI
- Check port 5000 is not in use

**Frontend won't start:**
- Check Node.js version (v14+)
- Delete `node_modules` and reinstall
- Check port 5173 is available

**Login fails:**
- Verify credentials are correct
- Check backend server is running
- Check browser console for errors

**Database connection error:**
- Verify MongoDB is running locally OR
- Update MONGODB_URI in `.env` with Atlas connection string

---

## 📝 Notes for Presentation

1. **Keep it simple** - Focus on key features
2. **Show, don't tell** - Let the system speak for itself
3. **Have backup** - Use multiple admin accounts
4. **Practice the flow** - Rehearse the demo beforehand
5. **Be ready for questions** - Know your tech stack

---

## 🎯 Quick Test Command Reference

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev

# Seed admin accounts (if needed)
cd backend && npm run seed:admins

# Check MongoDB connection
# Visit: http://localhost:5000
# Should see: {"message":"UniFlow API is running"}
```

---

**Good luck with your presentation! 🚀**

