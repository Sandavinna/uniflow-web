import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import LecturerDashboard from './pages/dashboards/LecturerDashboard'
import MedicalStaffDashboard from './pages/dashboards/MedicalStaffDashboard'
import CanteenStaffDashboard from './pages/dashboards/CanteenStaffDashboard'
import HostelAdminDashboard from './pages/dashboards/HostelAdminDashboard'
import Courses from './pages/Courses'
import Attendance from './pages/Attendance'
import Notices from './pages/Notices'
import Hostel from './pages/Hostel'
import Canteen from './pages/Canteen'
import Medical from './pages/Medical'
import Profile from './pages/Profile'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/admin/*"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/*"
                element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
            <Route
              path="/lecturer/*"
              element={
                <PrivateRoute allowedRoles={['lecturer']}>
                  <LecturerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/medical_staff/*"
              element={
                <PrivateRoute allowedRoles={['medical_staff']}>
                  <MedicalStaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/canteen_staff/*"
              element={
                <PrivateRoute allowedRoles={['canteen_staff']}>
                  <CanteenStaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hostel_admin/*"
              element={
                <PrivateRoute allowedRoles={['hostel_admin']}>
                  <HostelAdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

