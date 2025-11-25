import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DashboardHome from './DashboardHome'
import Canteen from '../Canteen'
import Notices from '../Notices'
import Profile from '../Profile'

const CanteenStaffDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome role="canteen_staff" />} />
        <Route path="canteen" element={<Canteen />} />
        <Route path="notices" element={<Notices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/canteen_staff" replace />} />
      </Routes>
    </Layout>
  )
}

export default CanteenStaffDashboard





