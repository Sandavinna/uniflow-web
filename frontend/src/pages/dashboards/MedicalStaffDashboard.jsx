import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import DashboardHome from './DashboardHome'
import Medical from '../Medical'
import Notices from '../Notices'
import Profile from '../Profile'

const MedicalStaffDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<DashboardHome role="medical_staff" />} />
        <Route path="medical" element={<Medical />} />
        <Route path="notices" element={<Notices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/medical_staff" replace />} />
      </Routes>
    </Layout>
  )
}

export default MedicalStaffDashboard

