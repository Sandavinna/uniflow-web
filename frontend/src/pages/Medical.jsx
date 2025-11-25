import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiHeart, FiClock, FiCheckCircle, FiXCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

const Medical = () => {
  const { user } = useAuth()
  const [availabilityStatus, setAvailabilityStatus] = useState(null)
  const [myAvailability, setMyAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [availabilityData, setAvailabilityData] = useState({
    isAvailable: false,
    availableFrom: '09:00',
    availableTo: '17:00',
    currentStatus: 'off_duty',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (user?.role === 'student') {
        const statusRes = await axios.get('/api/medical/staff/status')
        setAvailabilityStatus(statusRes.data)
      } else if (user?.role === 'medical_staff') {
        const availabilityRes = await axios.get('/api/medical/staff/availability')
        setMyAvailability(availabilityRes.data[0] || null)
        if (availabilityRes.data[0]) {
          setAvailabilityData({
            isAvailable: availabilityRes.data[0].isAvailable,
            availableFrom: availabilityRes.data[0].availableFrom,
            availableTo: availabilityRes.data[0].availableTo,
            currentStatus: availabilityRes.data[0].currentStatus,
            notes: availabilityRes.data[0].notes || '',
          })
        }
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAvailability = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/api/medical/staff/availability', availabilityData)
      toast.success('Availability updated successfully!')
      setShowAvailabilityModal(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Medical Services</h1>
        {user?.role === 'medical_staff' && (
          <button
            onClick={() => setShowAvailabilityModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiClock />
            <span>Update Availability</span>
          </button>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Medical Nurse Availability</h2>
            <div className="flex items-center space-x-2">
              {availabilityStatus?.isAvailable ? (
                <>
                  <FiCheckCircle className="text-green-600" size={24} />
                  <span className="text-green-600 font-semibold text-lg">Available</span>
                </>
              ) : (
                <>
                  <FiXCircle className="text-red-600" size={24} />
                  <span className="text-red-600 font-semibold text-lg">Not Available</span>
                </>
              )}
            </div>
          </div>
          {availabilityStatus?.isAvailable && availabilityStatus.staff && availabilityStatus.staff.length > 0 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                {availabilityStatus.availableCount} medical staff member(s) available
              </p>
              {availabilityStatus.staff.map((staff, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{staff.name}</p>
                      <p className="text-sm text-gray-600">
                        Available: {staff.availableFrom} - {staff.availableTo}
                      </p>
                      {staff.notes && (
                        <p className="text-sm text-gray-600 mt-1">Notes: {staff.notes}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        staff.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : staff.status === 'busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {staff.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!availabilityStatus?.isAvailable && (
            <p className="text-gray-600">No medical staff members are currently available.</p>
          )}
        </div>
      )}

      {user?.role === 'medical_staff' && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Availability</h2>
          {myAvailability ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Status:</span>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    myAvailability.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {myAvailability.isAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Current Status:</span>
                <span className="text-gray-900 capitalize">
                  {myAvailability.currentStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Available Hours:</span>
                <span className="text-gray-900">
                  {myAvailability.availableFrom} - {myAvailability.availableTo}
                </span>
              </div>
              {myAvailability.notes && (
                <div>
                  <span className="text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1">{myAvailability.notes}</p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Last updated: {new Date(myAvailability.lastUpdated).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No availability set. Click "Update Availability" to set your availability.</p>
          )}
        </div>
      )}

      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Update Availability</h2>
            <form onSubmit={handleUpdateAvailability} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Available</label>
                <button
                  type="button"
                  onClick={() =>
                    setAvailabilityData({
                      ...availabilityData,
                      isAvailable: !availabilityData.isAvailable,
                    })
                  }
                  className="text-3xl"
                >
                  {availabilityData.isAvailable ? (
                    <FiToggleRight className="text-green-600" />
                  ) : (
                    <FiToggleLeft className="text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="time"
                    value={availabilityData.availableFrom}
                    onChange={(e) =>
                      setAvailabilityData({
                        ...availabilityData,
                        availableFrom: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available To
                  </label>
                  <input
                    type="time"
                    value={availabilityData.availableTo}
                    onChange={(e) =>
                      setAvailabilityData({
                        ...availabilityData,
                        availableTo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <select
                  value={availabilityData.currentStatus}
                  onChange={(e) =>
                    setAvailabilityData({
                      ...availabilityData,
                      currentStatus: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={availabilityData.notes}
                  onChange={(e) =>
                    setAvailabilityData({ ...availabilityData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Optional notes about your availability"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAvailabilityModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medical
