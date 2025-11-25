import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiHome, FiUser, FiMessageSquare, FiTool, FiSend, FiCheck } from 'react-icons/fi'

const Hostel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('rooms')
  const [hostels, setHostels] = useState([])
  const [messages, setMessages] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [students, setStudents] = useState([])
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
  })
  const [maintenanceData, setMaintenanceData] = useState({
    issueType: 'broken_chair',
    description: '',
    priority: 'medium',
    roomNumber: '',
  })
  const [allocateData, setAllocateData] = useState({
    studentId: '',
  })

  useEffect(() => {
    fetchData()
  }, [activeTab, user])

  const fetchData = async () => {
    try {
      const [hostelsRes] = await Promise.all([
        axios.get('/api/hostel'),
        activeTab === 'messages' && axios.get('/api/hostel/messages').then(res => setMessages(res.data)).catch(() => {}),
        activeTab === 'maintenance' && axios.get('/api/hostel/maintenance').then(res => setMaintenanceRequests(res.data)).catch(() => {}),
        (user?.role === 'admin' || user?.role === 'hostel_admin') && axios.get('/api/users?role=student').then(res => setStudents(res.data)).catch(() => {}),
      ])
      setHostels(hostelsRes.data)
      if (activeTab === 'messages') {
        try {
          const messagesRes = await axios.get('/api/hostel/messages')
          setMessages(messagesRes.data || [])
        } catch (error) {
          console.error('Error fetching messages:', error)
          toast.error(error.response?.data?.message || 'Failed to fetch messages')
          setMessages([])
        }
      }
      if (activeTab === 'maintenance') {
        try {
          const maintenanceRes = await axios.get('/api/hostel/maintenance')
          setMaintenanceRequests(maintenanceRes.data || [])
        } catch (error) {
          console.error('Error fetching maintenance requests:', error)
          toast.error(error.response?.data?.message || 'Failed to fetch maintenance requests')
          setMaintenanceRequests([])
        }
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/hostel/messages', messageData)
      toast.success('Message sent successfully!')
      setShowMessageModal(false)
      setMessageData({ subject: '', message: '' })
      // Refresh messages if on messages tab
      if (activeTab === 'messages') {
        try {
          const messagesRes = await axios.get('/api/hostel/messages')
          setMessages(messagesRes.data || [])
        } catch (error) {
          console.error('Error refreshing messages:', error)
        }
      }
      fetchData()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.response?.data?.message || 'Failed to send message')
    }
  }

  const handleReplyMessage = async (messageId, reply) => {
    try {
      await axios.put(`/api/hostel/messages/${messageId}/reply`, { reply })
      toast.success('Reply sent successfully!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply')
    }
  }

  const handleCreateMaintenance = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/hostel/maintenance', maintenanceData)
      toast.success('Maintenance request created successfully!')
      setShowMaintenanceModal(false)
      setMaintenanceData({ issueType: 'broken_chair', description: '', priority: 'medium', roomNumber: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create maintenance request')
    }
  }

  const handleUpdateMaintenance = async (requestId, status) => {
    try {
      await axios.put(`/api/hostel/maintenance/${requestId}`, { status })
      toast.success('Maintenance request updated!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request')
    }
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/hostel/${selectedHostel}/allocate`, allocateData)
      toast.success('Room allocated successfully!')
      setShowAllocateModal(false)
      setSelectedHostel(null)
      setAllocateData({ studentId: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate room')
    }
  }

  const getIssueTypeLabel = (type) => {
    const labels = {
      broken_chair: 'Broken Chair',
      water_leakage: 'Water Leakage',
      electrical: 'Electrical Issue',
      plumbing: 'Plumbing Issue',
      furniture: 'Furniture Issue',
      other: 'Other',
    }
    return labels[type] || type
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
      case 'replied':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
        {user?.role === 'student' && activeTab === 'messages' && (
          <button
            onClick={() => setShowMessageModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiSend />
            <span>Send Message</span>
          </button>
        )}
        {user?.role === 'student' && activeTab === 'maintenance' && (
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiTool />
            <span>Request Maintenance</span>
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rooms'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiHome className="inline mr-2" />
              Rooms
            </button>
            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiMessageSquare className="inline mr-2" />
                Messages
              </button>
            )}
            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'maintenance'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiTool className="inline mr-2" />
                Maintenance
              </button>
            )}
            {(user?.role === 'admin' || user?.role === 'hostel_admin') && (
              <>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'messages'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiMessageSquare className="inline mr-2" />
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'maintenance'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FiTool className="inline mr-2" />
                  Maintenance Requests
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((hostel) => (
            <div
              key={hostel._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{hostel.name}</h3>
                  <p className="text-sm text-gray-600">
                    Block {hostel.block} • Room {hostel.roomNumber}
                  </p>
                </div>
                <FiHome className="text-primary-600" size={24} />
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  Capacity: {hostel.currentOccupancy}/{hostel.capacity}
                </p>
                <p className="text-sm text-gray-600">Rent: ${hostel.monthlyRent}/month</p>
                <p className="text-sm text-gray-600">
                  Status:{' '}
                  <span
                    className={`font-semibold ${
                      hostel.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {hostel.isAvailable ? 'Available' : 'Full'}
                  </span>
                </p>
                {hostel.amenities && hostel.amenities.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Amenities:</p>
                    <p>{hostel.amenities.join(', ')}</p>
                  </div>
                )}
              </div>
              {hostel.occupants && hostel.occupants.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Occupants:</p>
                  {hostel.occupants
                    .filter((o) => o.isActive)
                    .map((occupant, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        <FiUser className="inline mr-2" />
                        {occupant.student?.name || 'N/A'}
                      </div>
                    ))}
                </div>
              )}
              {(user?.role === 'admin' || user?.role === 'hostel_admin') && hostel.isAvailable && (
                <button
                  onClick={() => {
                    setSelectedHostel(hostel._id)
                    setShowAllocateModal(true)
                  }}
                  className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Allocate Room
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{message.subject}</h3>
                  <p className="text-sm text-gray-600">
                    From: {message.student?.name} ({message.student?.studentId}) •{' '}
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    message.status
                  )}`}
                >
                  {message.status}
                </span>
              </div>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.message}</p>
              {message.reply && (
                <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Reply from Sub-Warden:</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.reply}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.repliedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {(user?.role === 'admin' || user?.role === 'hostel_admin') && !message.reply && (
                <div className="mt-4 pt-4 border-t">
                  <textarea
                    id={`reply-${message._id}`}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-2 border rounded-lg mb-2"
                    rows="3"
                  />
                  <button
                    onClick={() => {
                      const reply = document.getElementById(`reply-${message._id}`).value
                      if (reply.trim()) {
                        handleReplyMessage(message._id, reply)
                      }
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FiMessageSquare className="mx-auto mb-4" size={48} />
              <p>No messages</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {maintenanceRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {getIssueTypeLabel(request.issueType)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {request.roomNumber && `Room: ${request.roomNumber} • `}
                    {(user?.role === 'admin' || user?.role === 'hostel_admin') && `Student: ${request.student?.name} • `}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      request.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : request.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {request.priority}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{request.description}</p>
              {(user?.role === 'admin' || user?.role === 'hostel_admin') && request.status !== 'completed' && (
                <div className="mt-4 pt-4 border-t flex space-x-2">
                  <button
                    onClick={() => handleUpdateMaintenance(request._id, 'in_progress')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateMaintenance(request._id, 'completed')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <FiCheck />
                    <span>Mark Completed</span>
                  </button>
                </div>
              )}
            </div>
          ))}
          {maintenanceRequests.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FiTool className="mx-auto mb-4" size={48} />
              <p>No maintenance requests</p>
            </div>
          )}
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Send Message to Sub-Warden</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={messageData.subject}
                onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Message"
                value={messageData.message}
                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="5"
                required
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Request Maintenance</h2>
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <select
                value={maintenanceData.issueType}
                onChange={(e) =>
                  setMaintenanceData({ ...maintenanceData, issueType: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="broken_chair">Broken Chair</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="electrical">Electrical Issue</option>
                <option value="plumbing">Plumbing Issue</option>
                <option value="furniture">Furniture Issue</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Room Number (Optional - e.g., A-101)"
                value={maintenanceData.roomNumber}
                onChange={(e) =>
                  setMaintenanceData({ ...maintenanceData, roomNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={maintenanceData.description}
                onChange={(e) =>
                  setMaintenanceData({ ...maintenanceData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
                required
              />
              <select
                value={maintenanceData.priority}
                onChange={(e) =>
                  setMaintenanceData({ ...maintenanceData, priority: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAllocateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Allocate Room</h2>
            <form onSubmit={handleAllocate} className="space-y-4">
              <select
                value={allocateData.studentId}
                onChange={(e) =>
                  setAllocateData({ ...allocateData, studentId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocateModal(false)
                    setSelectedHostel(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hostel
