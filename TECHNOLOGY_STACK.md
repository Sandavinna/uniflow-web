# UniFlow Student Management System - Technology Stack

## 📋 Project Overview
UniFlow is a comprehensive student management system with role-based access control, QR code-based attendance tracking, and multiple administrative modules.

---

## 🔧 Backend Technologies

### Core Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js v4.18.2** - Web application framework for building RESTful APIs
- **MongoDB** - NoSQL database for data storage
- **Mongoose v8.0.3** - MongoDB object modeling tool (ODM)

### Authentication & Security
- **JSON Web Token (JWT) v9.0.2** - For secure user authentication and authorization
- **bcryptjs v2.4.3** - Password hashing and encryption
- **crypto** (Node.js built-in) - For generating secure random tokens (QR codes, password reset)

### Data Validation
- **express-validator v7.0.1** - Request validation and sanitization middleware

### File Upload
- **Multer v1.4.5** - Middleware for handling multipart/form-data (profile image uploads)

### Email Services
- **Nodemailer v6.10.1** - Email sending service (for password reset, notifications)

### QR Code Generation (Backend)
- **qrcode v1.5.3** - Server-side QR code generation library
- **crypto** (Node.js built-in) - Generates unique secure tokens for QR codes

### Environment Configuration
- **dotenv v16.3.1** - Environment variable management

### CORS
- **cors v2.8.5** - Cross-Origin Resource Sharing middleware

### Development Tools
- **nodemon v3.0.2** - Development server with auto-restart on file changes

---

## 🎨 Frontend Technologies

### Core Framework
- **React v18.2.0** - JavaScript library for building user interfaces
- **React DOM v18.2.0** - React renderer for web applications

### Routing
- **React Router DOM v6.20.1** - Client-side routing and navigation

### HTTP Client
- **Axios v1.6.2** - Promise-based HTTP client for API requests

### QR Code Display & Scanning (Frontend)
- **qrcode.react v3.1.0** - React component for displaying QR codes
- **html5-qrcode v2.3.8** - QR code scanning library using device camera

### UI Components & Icons
- **React Icons v4.12.0** - Popular icon library (Feather Icons - Fi)

### Notifications
- **React Toastify v9.1.3** - Toast notification library for user feedback

### Styling
- **Tailwind CSS v3.3.6** - Utility-first CSS framework
- **PostCSS v8.4.32** - CSS transformation tool
- **Autoprefixer v10.4.16** - Automatic vendor prefixing for CSS

### Build Tool
- **Vite v5.0.8** - Next-generation frontend build tool (faster than Webpack)
- **@vitejs/plugin-react v4.2.1** - Vite plugin for React support

### TypeScript Support (Development)
- **@types/react v18.2.43** - TypeScript definitions for React
- **@types/react-dom v18.2.17** - TypeScript definitions for React DOM

---

## 🗄️ Database

### Database System
- **MongoDB** - Document-oriented NoSQL database
- **Mongoose ODM** - Schema-based solution for modeling application data

### Data Models
- User (Students, Lecturers, Admins, Medical Staff, Canteen Staff, Hostel Admin)
- Course
- Attendance
- QRCode
- Notice
- Hostel
- HostelMessage
- MaintenanceRequest
- Medical
- MedicalStaff
- Canteen
- PasswordResetToken

---

## 🔐 Authentication & Authorization System

### Authentication Method
- **JWT (JSON Web Tokens)** - Stateless authentication
- Token-based session management
- Secure password hashing with bcryptjs

### Role-Based Access Control (RBAC)
- **Roles Implemented:**
  - `admin` - Full system access
  - `student` - Student portal access
  - `lecturer` - Course and attendance management
  - `medical_staff` - Medical records access
  - `canteen_staff` - Canteen menu management
  - `hostel_admin` - Hostel and maintenance management

### Middleware
- `protect` - Authentication middleware
- `authorize` - Role-based authorization middleware

---

## 📱 QR Code Attendance System

### QR Code Generation
- **Backend:** `qrcode` library + `crypto` for secure token generation
- **Frontend Display:** `qrcode.react` component
- **Token Generation:** Cryptographically secure random tokens (32 bytes hex)

### QR Code Scanning
- **Library:** `html5-qrcode` - Browser-based QR code scanner
- **Method:** Uses device camera for real-time scanning
- **Validation:** Server-side token verification and expiration checking

### Features
- Time-limited QR codes (configurable duration)
- Automatic expiration handling
- Duplicate scan prevention
- Course enrollment validation
- Real-time attendance marking

---

## 📁 File Upload System

### Technology
- **Multer** - Multipart/form-data handling
- **Storage:** Local file system (`backend/uploads/profileImages/`)
- **File Types:** Images only (JPEG, JPG, PNG, GIF)
- **File Size Limit:** 5MB per file
- **Serving:** Static file serving via Express

---

## 📧 Email Service

### Technology
- **Nodemailer** - Email sending library
- **Protocol:** SMTP (configurable)
- **Features:**
  - Password reset emails
  - Email verification (if implemented)
  - Notification emails

### Configuration
- Supports Gmail, custom SMTP servers
- Environment-based configuration
- Graceful fallback (console logging if not configured)

---

## 🎯 Key Features & Modules

### 1. User Management
- Student registration with academic year selection
- Profile management with image upload
- Role-based dashboards

### 2. Course Management
- Course creation (Admin only)
- Academic year and semester filtering
- Student enrollment
- Course filtering by academic year

### 3. Attendance System
- QR code generation by lecturers
- Real-time QR code scanning by students
- Attendance tracking and reporting
- Automatic attendance marking

### 4. Hostel Management
- Room allocation
- Student-hostel admin messaging
- Maintenance request system
- Hostel admin dashboard

### 5. Medical Records
- Medical appointment booking
- Medical record management
- Medical staff dashboard

### 6. Canteen
- Menu display
- Menu management (Canteen Staff)

### 7. Notices
- Notice creation and management
- Role-based notice distribution

---

## 🛠️ Development Environment

### Backend
- **Runtime:** Node.js
- **Package Manager:** npm
- **Development Server:** nodemon (auto-restart)
- **Port:** 5000 (default, configurable via .env)

### Frontend
- **Build Tool:** Vite
- **Development Server:** Vite dev server (HMR - Hot Module Replacement)
- **Port:** 5173 (default, Vite default)

### Environment Variables
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD` - Email configuration

---

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing (salt rounds)
   - Secure password reset tokens

2. **Authentication**
   - JWT token-based authentication
   - Token expiration handling
   - Protected routes

3. **Authorization**
   - Role-based access control
   - Route-level permission checking
   - Resource-level authorization

4. **Data Validation**
   - Input sanitization
   - Request validation
   - File type and size restrictions

5. **QR Code Security**
   - Cryptographically secure token generation
   - Time-limited validity
   - Single-use validation

---

## 📊 API Architecture

### RESTful API Design
- **Base URL:** `/api`
- **Endpoints:**
  - `/api/auth` - Authentication routes
  - `/api/courses` - Course management
  - `/api/attendance` - Attendance and QR codes
  - `/api/notices` - Notice management
  - `/api/hostel` - Hostel operations
  - `/api/canteen` - Canteen menu
  - `/api/medical` - Medical records
  - `/api/users` - User management

### HTTP Methods
- GET - Retrieve data
- POST - Create resources
- PUT/PATCH - Update resources
- DELETE - Remove resources

---

## 🎨 UI/UX Design

### Design System
- **Framework:** Tailwind CSS
- **Icons:** React Icons (Feather Icons)
- **Color Scheme:** Custom light blue theme
- **Design Patterns:**
  - Glassmorphism effects
  - Gradient backgrounds
  - Smooth animations
  - Responsive design

### Key UI Features
- Modern, clean interface
- Role-based navigation
- Responsive layouts
- Toast notifications
- Loading states
- Error handling UI

---

## 📦 Project Structure

```
uniflow-web/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── uploads/         # File uploads
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
│
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   └── App.jsx      # Main app component
    └── index.html       # HTML template
```

---

## 🚀 Deployment Considerations

### Backend
- Node.js server
- MongoDB database (local or cloud - MongoDB Atlas)
- Environment variables configuration
- File upload directory setup

### Frontend
- Static file hosting
- Build output: `dist/` folder (Vite)
- API proxy configuration for production

### Recommended Hosting
- **Backend:** Heroku, Railway, Render, AWS, DigitalOcean
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** MongoDB Atlas (cloud) or self-hosted

---

## 📝 Summary for Supervisor Discussion

### Technology Choices Justification

1. **MERN Stack (MongoDB, Express, React, Node.js)**
   - Industry-standard full-stack solution
   - JavaScript throughout (code reusability)
   - Large community support
   - Scalable architecture

2. **QR Code Attendance System**
   - Modern, contactless attendance tracking
   - Real-time validation
   - Secure token-based system
   - Reduces manual errors

3. **Role-Based Access Control**
   - Secure multi-role system
   - Granular permissions
   - Scalable for future roles

4. **Vite Build Tool**
   - Faster development experience
   - Optimized production builds
   - Modern tooling

5. **Tailwind CSS**
   - Rapid UI development
   - Consistent design system
   - Responsive by default

### Key Achievements
- ✅ Complete authentication and authorization system
- ✅ QR code-based attendance tracking
- ✅ Multi-role dashboard system
- ✅ File upload functionality
- ✅ Real-time data updates
- ✅ Responsive design
- ✅ Secure API architecture

---

## 📚 Learning Outcomes

- Full-stack web development
- RESTful API design
- Database modeling and relationships
- Authentication and security best practices
- QR code integration
- File upload handling
- Role-based access control
- Modern React patterns (Hooks, Context)
- Responsive UI design

---

*Document Generated: 2024*
*Project: UniFlow Student Management System*


