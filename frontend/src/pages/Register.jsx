import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiUser, FiHash, FiPlus, FiTrash2 } from 'react-icons/fi'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: '',
    academicYear: '',
    phone: '',
    lecturerCourses: [], // Array of { year, courses: [{ courseCode, courseName }] }
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Reset lecturer courses when role changes away from lecturer
    if (name === 'role' && value !== 'lecturer') {
      setFormData({
        ...formData,
        [name]: value,
        lecturerCourses: [],
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      const errors = []
      if (!passwordValidation.minLength) errors.push('at least 8 characters')
      if (!passwordValidation.hasUpperCase) errors.push('one uppercase letter')
      if (!passwordValidation.hasLowerCase) errors.push('one lowercase letter')
      if (!passwordValidation.hasNumber) errors.push('one number')
      if (!passwordValidation.hasSpecialChar) errors.push('one special character')
      toast.error(`Password must contain: ${errors.join(', ')}`)
      return
    }

    // Validate lecturer courses
    if (formData.role === 'lecturer') {
      if (!formData.lecturerCourses || formData.lecturerCourses.length === 0) {
        toast.error('Please add at least one course for your year(s)')
        return
      }
      // Validate that each year has at least one course with both code and name
      for (const yearData of formData.lecturerCourses) {
        if (!yearData.courses || yearData.courses.length === 0) {
          toast.error(`Please add at least one course for ${yearData.year}`)
          return
        }
        for (const course of yearData.courses) {
          if (!course.courseCode || !course.courseName) {
            toast.error('Please fill in both course code and course name for all courses')
            return
          }
        }
      }
    }

    setLoading(true)

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)

    if (result.success) {
      if (result.pending) {
        toast.success(result.message || 'Registration successful! Your account is pending admin approval.')
        navigate('/login')
      } else {
        toast.success('Registration successful!')
        const roleRoute = formData.role === 'medical_staff' ? 'medical_staff' : formData.role === 'canteen_staff' ? 'canteen_staff' : formData.role === 'hostel_admin' ? 'hostel_admin' : formData.role
        navigate(`/${roleRoute}`)
      }
    } else {
      toast.error(result.message || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10 relative z-10 animate-slide-in overflow-y-auto" style={{maxHeight: '90vh'}}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
              <img 
                src="/images/logo.png" 
                alt="UniFlow Logo" 
                className="h-16 w-auto max-w-xs"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join UniFlow Student Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field pl-12"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field pl-12"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="medical_staff">Medical Staff</option>
              <option value="canteen_staff">Canteen Staff</option>
              <option value="hostel_admin">Hostel Admin</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="Enter student ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Academic Year</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Year 5">Year 5</option>
                </select>
              </div>
            </>
          )}

          {(formData.role === 'student' || formData.role === 'lecturer') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter department"
              />
            </div>
          )}

          {formData.role === 'lecturer' && (
            <div className="mt-6 p-5 bg-yellow-100 border-4 border-yellow-500 rounded-lg shadow-xl" style={{display: 'block !important', visibility: 'visible !important'}}>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                📚 Courses (Year-wise) <span className="text-red-600 text-xl">* REQUIRED</span>
                <span className="block text-sm font-bold text-red-700 mt-2 bg-red-100 p-2 rounded">
                  ⚠️ You must add at least one course to register as a lecturer
                </span>
              </label>
              <div className="space-y-4 border-3 border-blue-500 rounded-lg p-5 bg-white shadow-lg">
                {formData.lecturerCourses.length === 0 ? (
                  <div className="text-center py-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                    <p className="text-base font-semibold text-gray-700 mb-2">
                      ⚠️ No courses added yet
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Click the <strong>"Add Year"</strong> button below to start adding courses.
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      You must add at least one course to register as a lecturer.
                    </p>
                  </div>
                ) : (
                  formData.lecturerCourses.map((yearData, yearIndex) => (
                    <div key={yearIndex} className="bg-white rounded-lg p-4 border border-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Year: {yearData.year}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newCourses = formData.lecturerCourses.filter((_, idx) => idx !== yearIndex)
                            setFormData({ ...formData, lecturerCourses: newCourses })
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {yearData.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Course Code (e.g., CS101)"
                              value={course.courseCode}
                              onChange={(e) => {
                                const newCourses = [...formData.lecturerCourses]
                                newCourses[yearIndex].courses[courseIndex].courseCode = e.target.value
                                setFormData({ ...formData, lecturerCourses: newCourses })
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              required
                            />
                            <input
                              type="text"
                              placeholder="Course Name"
                              value={course.courseName}
                              onChange={(e) => {
                                const newCourses = [...formData.lecturerCourses]
                                newCourses[yearIndex].courses[courseIndex].courseName = e.target.value
                                setFormData({ ...formData, lecturerCourses: newCourses })
                              }}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newCourses = [...formData.lecturerCourses]
                                newCourses[yearIndex].courses = newCourses[yearIndex].courses.filter((_, idx) => idx !== courseIndex)
                                setFormData({ ...formData, lecturerCourses: newCourses })
                              }}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newCourses = [...formData.lecturerCourses]
                            newCourses[yearIndex].courses.push({ courseCode: '', courseName: '' })
                            setFormData({ ...formData, lecturerCourses: newCourses })
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                        >
                          <FiPlus size={14} />
                          <span>Add Course</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-300">
                  <select
                    id="newYearSelect"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">Select Year to Add</option>
                    {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
                      .filter(year => !formData.lecturerCourses.some(y => y.year === year))
                      .map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('newYearSelect')
                      const selectedYear = select.value
                      if (selectedYear) {
                        setFormData({
                          ...formData,
                          lecturerCourses: [
                            ...formData.lecturerCourses,
                            { year: selectedYear, courses: [{ courseCode: '', courseName: '' }] }
                          ]
                        })
                        select.value = ''
                      } else {
                        toast.error('Please select a year first')
                      }
                    }}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center space-x-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiPlus size={18} />
                    <span>➕ Add Year</span>
                  </button>
                </div>
              </div>
              {formData.role === 'lecturer' && formData.lecturerCourses.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please add at least one course</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field pl-12"
                placeholder="Enter password"
              />
            </div>
            {formData.password && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${validatePassword(formData.password).minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`mr-2 ${validatePassword(formData.password).minLength ? 'text-green-500' : 'text-gray-400'}`}>
                      {validatePassword(formData.password).minLength ? '✓' : '○'}
                    </span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${validatePassword(formData.password).hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`mr-2 ${validatePassword(formData.password).hasUpperCase ? 'text-green-500' : 'text-gray-400'}`}>
                      {validatePassword(formData.password).hasUpperCase ? '✓' : '○'}
                    </span>
                    One uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center ${validatePassword(formData.password).hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`mr-2 ${validatePassword(formData.password).hasLowerCase ? 'text-green-500' : 'text-gray-400'}`}>
                      {validatePassword(formData.password).hasLowerCase ? '✓' : '○'}
                    </span>
                    One lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center ${validatePassword(formData.password).hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`mr-2 ${validatePassword(formData.password).hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                      {validatePassword(formData.password).hasNumber ? '✓' : '○'}
                    </span>
                    One number (0-9)
                  </li>
                  <li className={`flex items-center ${validatePassword(formData.password).hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`mr-2 ${validatePassword(formData.password).hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                      {validatePassword(formData.password).hasSpecialChar ? '✓' : '○'}
                    </span>
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field pl-12"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
                className="btn-primary w-full text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

