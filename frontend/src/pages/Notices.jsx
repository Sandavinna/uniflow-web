import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiBell, FiPlus, FiAlertCircle, FiTrash2 } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await axios.get('/api/notices')
      // Handle paginated response
      setNotices(response.data.data || response.data || [])
    } catch (error) {
      toast.error('Failed to fetch notices')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('priority', formData.priority)
      formDataToSend.append('targetAudience', JSON.stringify(formData.targetAudience))

      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }

      await axios.post('/api/notices', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('Notice created successfully!')
      setShowModal(false)
      setImageFile(null)
      setImagePreview(null)
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

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return
    }
    try {
      await axios.delete(`/api/notices/${noticeId}`)
      toast.success('Notice deleted successfully!')
      fetchNotices()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete notice')
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
        {user?.role !== 'student' && (
          <button
            onClick={() => {
              setImageFile(null)
              setImagePreview(null)
              setFormData({
                title: '',
                content: '',
                category: 'general',
                priority: 'medium',
                targetAudience: ['all'],
              })
              setShowModal(true)
            }}
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
                  Category: {notice.category} • By: {notice.createdBy?.name || 'N/A'} 
                  {notice.createdBy?.role && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {notice.createdBy.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )} • {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </div>
              {(user?.role === 'admin' || (user?.role !== 'student' && notice.createdBy?._id === user?._id)) && (
                <button
                  onClick={() => handleDelete(notice._id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Notice"
                >
                  <FiTrash2 size={20} />
                </button>
              )}
            </div>
            {notice.image && (
              <div className="mb-4">
                <img
                  src={`${API_URL}${notice.image}`}
                  alt={notice.title}
                  className="w-full max-w-2xl rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
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










