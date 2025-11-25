import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiBell, FiPlus, FiAlertCircle } from 'react-icons/fi'

const Notices = () => {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: ['all'],
  })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/api/notices')
      setNotices(response.data)
    } catch (error) {
      toast.error('Failed to fetch notices')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/notices', formData)
      toast.success('Notice created successfully!')
      setShowModal(false)
      setFormData({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        targetAudience: ['all'],
      })
      fetchNotices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create notice')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
        {(user?.role === 'admin' || user?.role === 'lecturer') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiPlus />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice._id}
            className={`bg-white rounded-lg shadow p-6 border-l-4 ${getPriorityColor(
              notice.priority
            )}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FiBell className="text-primary-600" />
                  <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                      notice.priority
                    )}`}
                  >
                    {notice.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Category: {notice.category} • By: {notice.createdBy?.name || 'N/A'} •{' '}
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiAlertCircle className="mx-auto mb-4" size={48} />
            <p>No notices available</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Notice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="5"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="hostel">Hostel</option>
                <option value="canteen">Canteen</option>
                <option value="medical">Medical</option>
                <option value="ecommerce">E-commerce</option>
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notices





