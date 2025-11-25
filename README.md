# UniFlow - Student Management System

A comprehensive full-stack web-based Student Management System built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Student, Lecturer)
  - Secure password hashing with bcrypt

- **Course Management**
  - Create and manage courses
  - Enroll students in courses
  - Course scheduling and details

- **Attendance System**
  - Mark student attendance
  - View attendance records and statistics
  - Filter by course, student, and date

- **Exam & Result Management**
  - Create exams (Quiz, Midterm, Final, Assignment)
  - Add and manage exam results
  - View exam schedules and results

- **Notice Board**
  - Create and manage notices
  - Category-based notices
  - Priority levels (Low, Medium, High, Urgent)

- **Hostel Management**
  - Manage hostel rooms and blocks
  - Allocate rooms to students
  - Track occupancy and availability

- **Canteen Ordering System**
  - Browse menu items
  - Place food orders
  - Track order status

- **Medical Services**
  - Book medical appointments
  - View medical records
  - Prescription management

- **Student E-commerce**
  - Buy and sell products
  - Manage product listings
  - Track orders

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- React Icons
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```
uniflow-web/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── attendanceController.js
│   │   ├── examController.js
│   │   ├── noticeController.js
│   │   ├── hostelController.js
│   │   ├── canteenController.js
│   │   ├── medicalController.js
│   │   ├── ecommerceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Attendance.js
│   │   ├── Exam.js
│   │   ├── Notice.js
│   │   ├── Hostel.js
│   │   ├── Canteen.js
│   │   ├── Medical.js
│   │   └── Ecommerce.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── examRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── hostelRoutes.js
│   │   ├── canteenRoutes.js
│   │   ├── medicalRoutes.js
│   │   ├── ecommerceRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Exams.jsx
│   │   │   ├── Notices.jsx
│   │   │   ├── Hostel.jsx
│   │   │   ├── Canteen.jsx
│   │   │   ├── Medical.jsx
│   │   │   ├── Ecommerce.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── dashboards/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── LecturerDashboard.jsx
│   │   │       └── DashboardHome.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uniflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Register a new account** at `/register`
   - Choose your role (Admin, Student, or Lecturer)
   - Fill in the required information

2. **Login** at `/login`
   - Use your registered email and password

3. **Access your dashboard** based on your role:
   - Admin: Full access to all modules
   - Student: Access to courses, attendance, exams, notices, hostel, canteen, medical, and e-commerce
   - Lecturer: Access to courses, attendance, exams, and notices

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin, Lecturer)
- `PUT /api/courses/:id` - Update course (Admin, Lecturer)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (Admin, Lecturer)
- `GET /api/attendance/stats` - Get attendance statistics
- `PUT /api/attendance/:id` - Update attendance (Admin, Lecturer)

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam (Admin, Lecturer)
- `POST /api/exams/:id/results` - Add exam result (Admin, Lecturer)

### Notices
- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create notice (Admin, Lecturer)

### Hostel
- `GET /api/hostel` - Get all hostel rooms
- `POST /api/hostel` - Create hostel room (Admin)
- `POST /api/hostel/:id/allocate` - Allocate room (Admin)

### Canteen
- `GET /api/canteen/menu` - Get menu items
- `POST /api/canteen/menu` - Create menu item (Admin)
- `POST /api/canteen/orders` - Create order (Student)
- `GET /api/canteen/orders` - Get orders

### Medical
- `GET /api/medical/appointments` - Get appointments
- `POST /api/medical/appointments` - Create appointment (Student)
- `GET /api/medical/records` - Get medical records

### E-commerce
- `GET /api/ecommerce/products` - Get products
- `POST /api/ecommerce/products` - Create product (Student)
- `POST /api/ecommerce/orders` - Create order (Student)
- `GET /api/ecommerce/orders` - Get orders

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `NODE_ENV` - Environment (development/production)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Protected API routes
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@uniflow.com or create an issue in the repository.





