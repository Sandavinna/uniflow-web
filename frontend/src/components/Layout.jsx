import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiBell,
  FiHome as FiHostel,
  FiCoffee,
  FiHeart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { useState } from 'react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = {
    admin: [
      { path: '/admin', icon: FiHome, label: 'Dashboard' },
      { path: '/admin/courses', icon: FiBook, label: 'Courses' },
      { path: '/admin/attendance', icon: FiCalendar, label: 'Attendance' },
      { path: '/admin/notices', icon: FiBell, label: 'Notices' },
      { path: '/admin/hostel', icon: FiHostel, label: 'Hostel' },
      { path: '/admin/canteen', icon: FiCoffee, label: 'Canteen' },
      { path: '/admin/medical', icon: FiHeart, label: 'Medical' },
      { path: '/admin/profile', icon: FiUser, label: 'Profile' },
    ],
    student: [
      { path: '/student', icon: FiHome, label: 'Dashboard' },
      { path: '/student/courses', icon: FiBook, label: 'Courses' },
      { path: '/student/attendance', icon: FiCalendar, label: 'Attendance' },
      { path: '/student/notices', icon: FiBell, label: 'Notices' },
      { path: '/student/hostel', icon: FiHostel, label: 'Hostel' },
      { path: '/student/canteen', icon: FiCoffee, label: 'Canteen' },
      { path: '/student/medical', icon: FiHeart, label: 'Medical' },
      { path: '/student/profile', icon: FiUser, label: 'Profile' },
    ],
    lecturer: [
      { path: '/lecturer', icon: FiHome, label: 'Dashboard' },
      { path: '/lecturer/courses', icon: FiBook, label: 'Courses' },
      { path: '/lecturer/attendance', icon: FiCalendar, label: 'Attendance' },
      { path: '/lecturer/notices', icon: FiBell, label: 'Notices' },
      { path: '/lecturer/profile', icon: FiUser, label: 'Profile' },
    ],
    medical_staff: [
      { path: '/medical_staff', icon: FiHome, label: 'Dashboard' },
      { path: '/medical_staff/medical', icon: FiHeart, label: 'Medical Services' },
      { path: '/medical_staff/notices', icon: FiBell, label: 'Notices' },
      { path: '/medical_staff/profile', icon: FiUser, label: 'Profile' },
    ],
    canteen_staff: [
      { path: '/canteen_staff', icon: FiHome, label: 'Dashboard' },
      { path: '/canteen_staff/canteen', icon: FiCoffee, label: 'Canteen' },
      { path: '/canteen_staff/notices', icon: FiBell, label: 'Notices' },
      { path: '/canteen_staff/profile', icon: FiUser, label: 'Profile' },
    ],
    hostel_admin: [
      { path: '/hostel_admin', icon: FiHome, label: 'Dashboard' },
      { path: '/hostel_admin/hostel', icon: FiHostel, label: 'Hostel' },
      { path: '/hostel_admin/notices', icon: FiBell, label: 'Notices' },
      { path: '/hostel_admin/profile', icon: FiUser, label: 'Profile' },
    ],
  }

  const items = menuItems[user?.role] || []

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100/40 via-sky-100/30 to-cyan-100/20">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static lg:translate-x-0 z-30 w-72 bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-lg border-r border-blue-100/50 transition-transform duration-300 ease-in-out h-full shadow-xl`}
      >
        <div className="flex flex-col h-full">
          <div className="relative overflow-hidden border-b border-blue-300/50 bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 shadow-md">
            {/* Slightly darker blue decorative background patterns */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-0 -right-10 w-40 h-40 bg-blue-400/50 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/50 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-cyan-400/50 rounded-full blur-xl"></div>
            </div>
            
            {/* Main content */}
            <div className="relative flex items-center justify-between p-5">
              <div className="flex items-center justify-center w-full">
                {/* Logo container matching login page style */}
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
                  <img 
                    src="/images/logo.png" 
                    alt="UniFlow Logo" 
                    className="h-12 w-auto"
                  />
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute right-4 z-10 p-2.5 rounded-xl text-blue-700 hover:text-blue-800 hover:bg-blue-200/50 transition-all duration-200"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-white/50">
            <ul className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-500/30 font-semibold'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 hover:text-primary-700 font-medium'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium hover:shadow-sm"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-white to-blue-100/40 backdrop-blur-lg border-b border-blue-200/50 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu size={24} />
          </button>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000${user.profileImage}`}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover border-3 border-primary-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-white">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in bg-gradient-to-br from-blue-50/20 via-white to-sky-50/20">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout

