import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiClock, FiUserCheck } from 'react-icons/fi'

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/users/registration-requests')
      // Handle paginated response
      setRequests(response.data.data || response.data || [])
    } catch (error) {
      toast.error('Failed to fetch registration requests')
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/users/registration-requests/${userId}/approve`)
      toast.success('Registration approved successfully!')
      fetchRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve registration')
    }
  }

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this registration request?')) {
      return
    }
    try {
      await axios.put(`/api/users/registration-requests/${userId}/reject`)
      toast.success('Registration rejected')
      fetchRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject registration')
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      lecturer: 'bg-blue-100 text-blue-800',
      medical_staff: 'bg-red-100 text-red-800',
      canteen_staff: 'bg-orange-100 text-orange-800',
      hostel_admin: 'bg-purple-100 text-purple-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const formatRole = (role) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Registration Requests
        </h1>
        <p className="text-gray-600 text-lg">
          Review and approve staff registration requests
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <FiUserCheck className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
          <p className="text-gray-500">All registration requests have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FiUser className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{request.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(request.role)}`}>
                        {formatRole(request.role)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <FiMail className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{request.email}</p>
                      </div>
                    </div>

                    {request.phone && (
                      <div className="flex items-center space-x-3 text-gray-700">
                        <FiPhone className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{request.phone}</p>
                        </div>
                      </div>
                    )}

                    {request.department && (
                      <div className="flex items-center space-x-3 text-gray-700">
                        <FiUser className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium">{request.department}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 text-gray-700">
                      <FiClock className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Requested On</p>
                        <p className="font-medium">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {request.lecturerCourses && request.lecturerCourses.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Assigned Courses:</p>
                      <div className="space-y-2">
                        {request.lecturerCourses.map((yearData, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            <span className="font-semibold">{yearData.year}:</span>{' '}
                            {yearData.courses?.map(c => `${c.courseCode} - ${c.courseName}`).join(', ') || 'No courses'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiCheckCircle size={18} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiXCircle size={18} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RegistrationRequests

