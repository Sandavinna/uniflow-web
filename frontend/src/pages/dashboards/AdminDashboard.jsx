import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DashboardHome from './DashboardHome'
import Courses from '../Courses'
import Attendance from '../Attendance'
import Notices from '../Notices'
import Hostel from '../Hostel'
import Canteen from '../Canteen'
import Medical from '../Medical'
import Profile from '../Profile'

const AdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome role="admin" />} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="notices" element={<Notices />} />
        <Route path="hostel" element={<Hostel />} />
        <Route path="canteen" element={<Canteen />} />
        <Route path="medical" element={<Medical />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Layout>
  )
}

export default AdminDashboard

