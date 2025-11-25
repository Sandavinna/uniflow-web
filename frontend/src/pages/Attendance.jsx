import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiCalendar, FiUser, FiCheck, FiX, FiMaximize2, FiUsers, FiCheckCircle, FiDownload, FiUpload } from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'

const Attendance = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('records')
  const [attendance, setAttendance] = useState([])
  const [courses, setCourses] = useState([])
  const [qrCodes, setQRCodes] = useState([])
  const [studentQRCodes, setStudentQRCodes] = useState([])
  const [selectedQR, setSelectedQR] = useState(null)
  const [qrAttendance, setQRAttendance] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQRForm, setShowQRForm] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: '',
  })
  const [qrFormData, setQRFormData] = useState({
    courseId: '',
    duration: 60,
  })

  useEffect(() => {
    // Set default tab for students
    if (user?.role === 'student') {
      setActiveTab('qr')
      fetchStudentQRCodes() // Fetch immediately for students
    }
    fetchData()
    // Poll for new QR codes every 5 seconds if student
    let interval
    if (user?.role === 'student') {
      interval = setInterval(() => {
        fetchStudentQRCodes()
      }, 5000) // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [user?.role])

  const fetchData = async () => {
    try {
      setLoading(true)
      const promises = [
        axios.get('/api/attendance').catch(err => {
          console.error('Error fetching attendance:', err)
          return { data: [] }
        }),
        axios.get('/api/courses').catch(err => {
          console.error('Error fetching courses:', err)
          return { data: [] }
        })
      ]
      
      if (user?.role === 'admin' || user?.role === 'lecturer') {
        promises.push(
          axios.get('/api/users?role=student').catch(err => {
            console.error('Error fetching students:', err)
            return { data: [] }
          }),
          axios.get('/api/attendance/qr').catch(err => {
            console.error('Error fetching QR codes:', err)
            return { data: [] }
          })
        )
      }
      
      const results = await Promise.all(promises)
      setAttendance(results[0].data)
      setCourses(results[1].data)
      
      if (user?.role === 'admin' || user?.role === 'lecturer') {
        setStudents(results[2].data)
        setQRCodes(results[3].data)
      }
      // Student QR codes are fetched separately in useEffect
    } catch (error) {
      console.error('Error in fetchData:', error)
      // Don't show toast for every error to avoid spam
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentQRCodes = async () => {
    try {
      const response = await axios.get('/api/attendance/qr/student')
      console.log('Student QR codes response:', response.data)
      setStudentQRCodes(response.data || [])
      // Log for debugging
      if (response.data && response.data.length > 0) {
        console.log('✅ Student QR codes fetched:', response.data.length)
      } else {
        console.log('⚠️ No QR codes found. Make sure you are enrolled in the course.')
      }
    } catch (error) {
      console.error('❌ Error fetching student QR codes:', error.response?.data || error.message)
      // Set empty array on error to prevent stale data
      setStudentQRCodes([])
      // Show error only on first load, not during polling
      if (!error.response || error.response.status === 500) {
        // Server error - might be temporary
        console.error('Server error - check backend logs')
      }
    }
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/attendance', formData)
      toast.success('Attendance marked successfully!')
      setShowModal(false)
      setFormData({
        student: '',
        course: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        remarks: '',
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    }
  }

  const handleGenerateQR = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/attendance/qr/generate', qrFormData)
      toast.success('QR code generated successfully! Students can now see it on their attendance page.')
      // Reset form and close modal
      setQRFormData({
        courseId: '',
        duration: 60,
      })
      setShowQRForm(false)
      // Refresh QR codes list to show the new QR code immediately
      if (user?.role === 'admin' || user?.role === 'lecturer') {
        try {
          const qrCodesRes = await axios.get('/api/attendance/qr')
          setQRCodes(qrCodesRes.data)
        } catch (error) {
          console.error('Error refreshing QR codes:', error)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code')
    }
  }

  const handleMarkAttendanceFromQR = async (token) => {
    try {
      const response = await axios.post('/api/attendance/qr/scan', { token })
      toast.success(response.data.message || 'Attendance marked successfully!')
      fetchStudentQRCodes()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    }
  }

  const handleDownloadQR = async (qrCodeId, courseCode) => {
    try {
      const response = await axios.get(`/api/attendance/qr/${qrCodeId}/download`, {
        responseType: 'blob',
      })
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `QR-${courseCode}-${qrCodeId}.png`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('QR code downloaded successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download QR code')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploadedFile(file)
    
    try {
      // Use html5-qrcode to decode the QR code from the image
      const html5QrCode = new Html5Qrcode('qr-reader')
      
      // Decode from file - scanFile returns the decoded text directly
      const decodedText = await html5QrCode.scanFile(file, true)
      
      // Clean up the scanner instance
      await html5QrCode.clear()
      
      if (decodedText) {
        // Send the decoded token to the backend
        const response = await axios.post('/api/attendance/qr/upload-scan', { 
          token: decodedText 
        })
        toast.success(response.data.message || 'Attendance marked successfully!')
        setShowUploadModal(false)
        setUploadedFile(null)
        fetchStudentQRCodes()
        fetchData()
      }
    } catch (error) {
      // Clean up on error
      try {
        const html5QrCode = new Html5Qrcode('qr-reader')
        await html5QrCode.clear()
      } catch (clearError) {
        // Ignore clear errors
      }
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to process QR code')
      } else {
        toast.error('Could not read QR code from image. Please make sure the image contains a valid QR code.')
      }
      setUploadedFile(null)
    }
  }

  const handleViewQRAttendance = async (qrCodeId) => {
    try {
      const response = await axios.get(`/api/attendance/qr/${qrCodeId}`)
      setQRAttendance(response.data)
      setSelectedQR(qrCodeId)
    } catch (error) {
      toast.error('Failed to fetch attendance records')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      case 'excused':
        return 'bg-blue-100 text-blue-800'
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
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        {(user?.role === 'admin' || user?.role === 'lecturer') && (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setShowQRForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <FiMaximize2 />
              <span>Generate QR</span>
            </button>
          </>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {user?.role === 'student' && (
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qr'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                QR Codes
              </button>
            )}
            <button
              onClick={() => setActiveTab('records')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'records'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance Records
            </button>
            {(user?.role === 'admin' || user?.role === 'lecturer') && (
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qr'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                QR Codes
              </button>
            )}
          </nav>
        </div>
      </div>

      {activeTab === 'qr' && user?.role === 'student' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Active QR Codes</h2>
              <p className="text-gray-600">Download the QR code and upload it using the "Upload QR Code" button to mark your attendance</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiUpload size={20} />
              <span>Upload QR Code</span>
            </button>
          </div>
          {studentQRCodes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <FiMaximize2 className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 font-semibold">No active QR codes available</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>To see QR codes, make sure:</p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>You are enrolled in the course (go to Courses page to enroll)</li>
                  <li>Your lecturer has generated a QR code for the course</li>
                  <li>The QR code hasn't expired</li>
                </ul>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                The page automatically refreshes every 5 seconds to check for new QR codes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentQRCodes.map((qr) => (
                <div
                  key={qr._id}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {qr.course?.courseCode} - {qr.course?.courseName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Lecturer: {qr.lecturer?.name}
                    </p>
                    <div className="flex justify-center mb-4 bg-white p-4 rounded-lg border-2 border-gray-200">
                      <QRCodeSVG
                        value={qr.token}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Expires: {new Date(qr.expiresAt).toLocaleTimeString()}
                    </p>
                    <div className="space-y-2">
                      {qr.alreadyScanned ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600 py-2">
                          <FiCheckCircle size={20} />
                          <span className="font-semibold">Attendance Marked</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 text-center py-2">
                          Download and upload this QR code to mark attendance
                        </p>
                      )}
                      {new Date(qr.expiresAt) < new Date() ? (
                        <div className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                          <FiDownload size={18} />
                          <span>Download Expired</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownloadQR(qr._id, qr.course?.courseCode)}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
                        >
                          <FiDownload size={18} />
                          <span>Download QR Code</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.student?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.course?.courseCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'qr' && (user?.role === 'admin' || user?.role === 'lecturer') && (
        <div className="space-y-4">
          {qrCodes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
              <FiMaximize2 className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">No QR codes generated yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "Generate QR" to create a QR code for attendance</p>
            </div>
          ) : (
            qrCodes.map((qr) => (
            <div
              key={qr._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {qr.course?.courseCode} - {qr.course?.courseName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(qr.date).toLocaleDateString()} • Expires:{' '}
                    {new Date(qr.expiresAt).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        qr.isActive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {qr.isActive ? 'Active' : 'Expired'}
                    </span>
                  </p>
                </div>
                {qr.isActive && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <QRCodeSVG
                        value={qr.token}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Published QR Code
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleViewQRAttendance(qr._id)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <FiUsers />
                  <span>View Attendance ({qr.attendanceRecords?.length || 0})</span>
                </button>
                {qr.isActive && new Date(qr.expiresAt) > new Date() && (
                  <button
                    onClick={() => handleDownloadQR(qr._id, qr.course?.courseCode)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <FiDownload size={18} />
                    <span>Download QR</span>
                  </button>
                )}
              </div>
              {selectedQR === qr._id && qrAttendance && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold mb-4">
                    Attendance Count: {qrAttendance.attendanceCount}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-sm font-medium text-gray-700">Student ID</th>
                          <th className="text-left text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left text-sm font-medium text-gray-700">Scanned At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {qrAttendance.attendanceRecords.map((record, idx) => (
                          <tr key={idx}>
                            <td className="py-2 text-sm text-gray-900">{record.studentId}</td>
                            <td className="py-2 text-sm text-gray-900">{record.name}</td>
                            <td className="py-2 text-sm text-gray-600">
                              {new Date(record.scannedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <select
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
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
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
              <textarea
                placeholder="Remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
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
                  Mark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Generate QR Code</h2>
            <form onSubmit={handleGenerateQR} className="space-y-4">
              <select
                value={qrFormData.courseId}
                onChange={(e) =>
                  setQRFormData({ ...qrFormData, courseId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={qrFormData.duration}
                onChange={(e) =>
                  setQRFormData({ ...qrFormData, duration: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg"
                min="1"
                max="120"
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQRForm(false)
                    setQRFormData({ courseId: '', duration: 60 })
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Upload QR Code</h2>
            <p className="text-gray-600 mb-4">
              Upload a QR code image that you downloaded from the system to mark your attendance.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select QR Code Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              {uploadedFile && (
                <div className="text-sm text-gray-600">
                  Processing: {uploadedFile.name}
                </div>
              )}
              <div id="qr-reader" className="hidden"></div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance
