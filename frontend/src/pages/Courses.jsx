import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiBook, FiUser, FiCalendar, FiPlus } from 'react-icons/fi'

const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    department: '',
    credits: '',
    year: '',
    semester: '',
    lecturer: '',
  })
  const [lecturers, setLecturers] = useState([])

  useEffect(() => {
    fetchCourses()
    if (user?.role === 'admin') {
      fetchLecturers()
    }
  }, [user?.role])

  const fetchLecturers = async () => {
    try {
      const response = await axios.get('/api/users?role=lecturer')
      setLecturers(response.data)
    } catch (error) {
      console.error('Failed to fetch lecturers:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses')
      setCourses(response.data)
    } catch (error) {
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/api/courses/${courseId}/enroll`)
      toast.success('Enrolled successfully!')
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/courses', formData)
      toast.success('Course created successfully!')
      setShowModal(false)
      setFormData({
        courseCode: '',
        courseName: '',
        description: '',
        department: '',
        credits: '',
        year: '',
        semester: '',
        lecturer: '',
      })
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiPlus />
            <span>Create Course</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{course.courseName}</h3>
                <p className="text-sm text-gray-600">{course.courseCode}</p>
              </div>
              <FiBook className="text-primary-600" size={24} />
            </div>
            <p className="text-gray-700 mb-4">{course.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiUser className="mr-2" />
                <span>
                  {course.lecturer?.name || 'N/A'} • {course.credits} Credits
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="mr-2" />
                <span>{course.year} • {course.semester}</span>
              </div>
            </div>
            {user?.role === 'student' &&
              !course.enrolledStudents?.some((s) => s._id === user._id) && (
                <button
                  onClick={() => handleEnroll(course._id)}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Enroll
                </button>
              )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Course Code"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData({ ...formData, courseCode: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Course Name"
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecturer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lecturer}
                  onChange={(e) =>
                    setFormData({ ...formData, lecturer: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer._id}>
                      {lecturer.name} ({lecturer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5">Year 5</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
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

export default Courses

