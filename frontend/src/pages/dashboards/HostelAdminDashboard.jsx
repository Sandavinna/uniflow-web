import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DashboardHome from './DashboardHome'
import Notices from '../Notices'
import Hostel from '../Hostel'
import Profile from '../Profile'

const HostelAdminDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome role="hostel_admin" />} />
        <Route path="notices" element={<Notices />} />
        <Route path="hostel" element={<Hostel />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/hostel_admin" replace />} />
      </Routes>
    </Layout>
  )
}

export default HostelAdminDashboard





