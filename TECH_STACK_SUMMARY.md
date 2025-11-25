# UniFlow - Technology Stack Summary

## 🎯 Quick Overview

**Project Type:** Full-Stack Web Application  
**Architecture:** MERN Stack (MongoDB, Express, React, Node.js)  
**Purpose:** Student Management System with QR Code Attendance

---

## 🔧 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express.js** | 4.18.2 | Web framework & REST API |
| **MongoDB** | - | Database |
| **Mongoose** | 8.0.3 | Database ODM |
| **JWT** | 9.0.2 | Authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Multer** | 1.4.5 | File uploads |
| **Nodemailer** | 6.10.1 | Email service |
| **qrcode** | 1.5.3 | QR code generation |
| **crypto** | Built-in | Secure token generation |

---

## 🎨 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **React Router** | 6.20.1 | Routing |
| **Axios** | 1.6.2 | HTTP client |
| **Tailwind CSS** | 3.3.6 | Styling |
| **Vite** | 5.0.8 | Build tool |
| **qrcode.react** | 3.1.0 | QR code display |
| **html5-qrcode** | 2.3.8 | QR code scanning |
| **React Toastify** | 9.1.3 | Notifications |
| **React Icons** | 4.12.0 | Icons |

---

## 🗄️ Database

- **MongoDB** - NoSQL document database
- **Mongoose** - Object Data Modeling

**Key Models:**
- User, Course, Attendance, QRCode, Notice, Hostel, Medical, Canteen

---

## 🔐 Security & Authentication

- **JWT** - Token-based authentication
- **bcryptjs** - Password encryption
- **Role-Based Access Control (RBAC)**
  - Admin, Student, Lecturer, Medical Staff, Canteen Staff, Hostel Admin

---

## 📱 QR Code System

**Backend:**
- `qrcode` library for generation
- `crypto` for secure token creation

**Frontend:**
- `qrcode.react` for display
- `html5-qrcode` for camera scanning

**Features:**
- Time-limited QR codes
- Secure token validation
- Real-time attendance marking

---

## 📁 File Handling

- **Multer** - File upload middleware
- **Storage:** Local filesystem (`uploads/profileImages/`)
- **Types:** Images only (JPG, PNG, GIF)
- **Limit:** 5MB per file

---

## 📧 Email Service

- **Nodemailer** - SMTP email sending
- **Use Cases:** Password reset, notifications

---

## 🎯 Key Features

1. ✅ Multi-role authentication system
2. ✅ QR code-based attendance tracking
3. ✅ Course management with academic year filtering
4. ✅ Hostel management (rooms, messages, maintenance)
5. ✅ Medical records system
6. ✅ Canteen menu display
7. ✅ Notice management
8. ✅ Profile management with image upload

---

## 🛠️ Development Tools

- **nodemon** - Auto-restart backend server
- **Vite** - Fast frontend build & dev server
- **PostCSS & Autoprefixer** - CSS processing

---

## 📊 API Structure

**RESTful API Endpoints:**
- `/api/auth` - Authentication
- `/api/courses` - Course management
- `/api/attendance` - Attendance & QR codes
- `/api/notices` - Notices
- `/api/hostel` - Hostel operations
- `/api/medical` - Medical records
- `/api/canteen` - Canteen menu
- `/api/users` - User management

---

## 🎨 UI/UX

- **Tailwind CSS** - Utility-first styling
- **Custom Theme** - Light blue color scheme
- **Design:** Modern, responsive, glassmorphism effects
- **Icons:** Feather Icons (React Icons)

---

## 🚀 Deployment Ready

**Backend Requirements:**
- Node.js environment
- MongoDB database
- Environment variables (.env)

**Frontend:**
- Static file hosting
- Vite build output

**Recommended Hosting:**
- Backend: Heroku, Railway, Render, AWS
- Frontend: Vercel, Netlify
- Database: MongoDB Atlas

---

## 💡 Why These Technologies?

1. **MERN Stack** - Industry standard, JavaScript throughout
2. **QR Code System** - Modern, contactless attendance
3. **JWT Authentication** - Secure, stateless auth
4. **Vite** - Fast development & builds
5. **Tailwind CSS** - Rapid UI development
6. **MongoDB** - Flexible schema for student data

---

*For detailed information, see TECHNOLOGY_STACK.md*

