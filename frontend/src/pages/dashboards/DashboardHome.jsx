import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { FiBook, FiCalendar, FiUsers, FiHeart, FiCheckCircle, FiXCircle, FiMessageSquare, FiTool } from 'react-icons/fi'

const DashboardHome = ({ role }) => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    courses: 0,
    attendance: 0,
    notices: 0,
  })
  const [medicalStatus, setMedicalStatus] = useState(null)

  useEffect(() => {
    fetchStats()
    if (role === 'student') {
      fetchMedicalStatus()
    }
  }, [role])

  const fetchStats = async () => {
    try {
      if (role === 'medical_staff' || role === 'canteen_staff' || role === 'hostel_admin') {
        const noticesRes = await axios.get('/api/notices')
        let hostelStats = { courses: 0, attendance: 0, notices: noticesRes.data.length }
        
        if (role === 'hostel_admin') {
          try {
            const [hostelsRes, messagesRes, maintenanceRes] = await Promise.all([
              axios.get('/api/hostel'),
              axios.get('/api/hostel/messages'),
              axios.get('/api/hostel/maintenance'),
            ])
            hostelStats = {
              ...hostelStats,
              hostels: hostelsRes.data.length,
              messages: messagesRes.data.length,
              maintenance: maintenanceRes.data.length,
            }
          } catch (error) {
            console.error('Error fetching hostel stats:', error)
          }
        }
        
        setStats(hostelStats)
      } else {
        const [coursesRes, attendanceRes, noticesRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/attendance'),
          axios.get('/api/notices'),
        ])

        setStats({
          courses: coursesRes.data.length,
          attendance: attendanceRes.data.length,
          notices: noticesRes.data.length,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMedicalStatus = async () => {
    try {
      const response = await axios.get('/api/medical/staff/status')
      setMedicalStatus(response.data)
    } catch (error) {
      console.error('Error fetching medical status:', error)
    }
  }

  const statCards = role === 'medical_staff' || role === 'canteen_staff'
    ? [
        {
          title: 'Notices',
          value: stats.notices,
          icon: FiUsers,
          color: 'bg-purple-500',
        },
      ]
    : role === 'hostel_admin'
    ? [
        {
          title: 'Hostel Rooms',
          value: stats.hostels || 0,
          icon: FiUsers,
          color: 'bg-purple-500',
        },
        {
          title: 'Messages',
          value: stats.messages || 0,
          icon: FiMessageSquare,
          color: 'bg-blue-500',
        },
        {
          title: 'Maintenance Requests',
          value: stats.maintenance || 0,
          icon: FiTool,
          color: 'bg-orange-500',
        },
        {
          title: 'Notices',
          value: stats.notices || 0,
          icon: FiBook,
          color: 'bg-green-500',
        },
      ]
    : [
        {
          title: 'Courses',
          value: stats.courses,
          icon: FiBook,
          color: 'bg-blue-500',
        },
        {
          title: 'Attendance Records',
          value: stats.attendance,
          icon: FiCalendar,
          color: 'bg-green-500',
        },
        {
          title: 'Notices',
          value: stats.notices,
          icon: FiUsers,
          color: 'bg-purple-500',
        },
      ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening in your dashboard today.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${role === 'medical_staff' || role === 'canteen_staff' ? 'md:grid-cols-1' : role === 'hostel_admin' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mb-8`}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="card group hover:scale-105 transition-transform duration-300"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">Total count</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
              <div className={`mt-4 h-1 bg-gradient-to-r ${stat.color} rounded-full`}></div>
            </div>
          )
        })}
      </div>

      {role === 'student' && medicalStatus && (
        <div className="card mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {medicalStatus.isAvailable ? (
                <>
                  <div className="p-4 bg-green-500 rounded-xl shadow-lg">
                    <FiCheckCircle className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Medical Nurse Status</h2>
                    <p className="text-lg font-semibold text-green-700">Available Now</p>
                    <p className="text-sm text-gray-600">
                      {medicalStatus.availableCount} staff member(s) available
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-red-500 rounded-xl shadow-lg">
                    <FiXCircle className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Medical Nurse Status</h2>
                    <p className="text-lg font-semibold text-red-700">Not Available</p>
                    <p className="text-sm text-gray-600">No staff members currently available</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {role === 'admin' && (
            <>
              <button className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 text-left transition-all duration-300 hover:shadow-md">
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-3 group-hover:bg-primary-500 transition-colors">
                  <FiUsers className="text-primary-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </button>
            </>
          )}
          {role === 'student' && (
            <>
              <button className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 text-left transition-all duration-300 hover:shadow-md">
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-3 group-hover:bg-primary-500 transition-colors">
                  <FiBook className="text-primary-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Enroll in Courses</h3>
                <p className="text-sm text-gray-600">Browse and enroll in courses</p>
              </button>
            </>
          )}
          {role === 'lecturer' && (
            <>
              <button className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 text-left transition-all duration-300 hover:shadow-md">
                <div className="p-3 bg-primary-100 rounded-lg w-fit mb-3 group-hover:bg-primary-500 transition-colors">
                  <FiCalendar className="text-primary-600 group-hover:text-white" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Mark Attendance</h3>
                <p className="text-sm text-gray-600">Mark student attendance</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome

