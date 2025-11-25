import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DashboardHome from './DashboardHome'
import Courses from '../Courses'
import Attendance from '../Attendance'
import Notices from '../Notices'
import Profile from '../Profile'

const LecturerDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome role="lecturer" />} />
        <Route path="courses" element={<Courses />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="notices" element={<Notices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/lecturer" replace />} />
      </Routes>
    </Layout>
  )
}

export default LecturerDashboard

