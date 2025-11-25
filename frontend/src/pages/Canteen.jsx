import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FiCoffee, FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

const Canteen = () => {
  const { user } = useAuth()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'breakfast',
    preparationTime: '15',
    isAvailable: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const menuRes = await axios.get('/api/canteen/menu')
      // Filter menu based on role - students see only available, staff see all
      const filteredMenu = user?.role === 'student' 
        ? menuRes.data.filter(item => item.isAvailable)
        : menuRes.data
      setMenu(filteredMenu)
    } catch (error) {
      toast.error('Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime?.toString() || '15',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    })
    setShowMenuModal(true)
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return
    }
    try {
      await axios.delete(`/api/canteen/menu/${itemId}`)
      toast.success('Menu item deleted successfully!')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item')
    }
  }

  const handleCreateMenuItem = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await axios.put(`/api/canteen/menu/${editingItem._id}`, {
          ...formData,
          price: parseFloat(formData.price),
          preparationTime: parseInt(formData.preparationTime),
          isAvailable: formData.isAvailable,
        })
        toast.success('Menu item updated successfully!')
      } else {
        await axios.post('/api/canteen/menu', {
          ...formData,
          price: parseFloat(formData.price),
          preparationTime: parseInt(formData.preparationTime),
          isAvailable: formData.isAvailable,
        })
        toast.success('Menu item created successfully!')
      }
      setShowMenuModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'breakfast',
        preparationTime: '15',
        isAvailable: true,
      })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save menu item')
    }
  }


  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Canteen Menu</h1>
        {(user?.role === 'admin' || user?.role === 'canteen_staff') && (
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'breakfast',
                preparationTime: '15',
                isAvailable: true,
              })
              setShowMenuModal(true)
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
          >
            <FiPlus />
            <span>Add Menu Item</span>
          </button>
        )}
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  {(user?.role === 'admin' || user?.role === 'canteen_staff') && !item.isAvailable && (
                    <span className="text-xs text-red-600 font-semibold">(Unavailable)</span>
                  )}
                </div>
                <FiCoffee className="text-primary-600" size={24} />
              </div>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary-600">LKR {item.price.toFixed(2)}</p>
                  {item.preparationTime && (
                    <p className="text-sm text-gray-600">
                      {item.preparationTime} min
                    </p>
                  )}
                </div>
                {(user?.role === 'admin' || user?.role === 'canteen_staff') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleCreateMenuItem} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  type="number"
                  step="0.01"
                  placeholder="Price (LKR)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Prep Time (min)"
                  value={formData.preparationTime}
                  onChange={(e) =>
                    setFormData({ ...formData, preparationTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
              </select>
              {(user?.role === 'admin' || user?.role === 'canteen_staff') && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Available</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isAvailable: !formData.isAvailable })
                    }
                    className="text-3xl"
                  >
                    {formData.isAvailable ? (
                      <FiToggleRight className="text-green-600" />
                    ) : (
                      <FiToggleLeft className="text-gray-400" />
                    )}
                  </button>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Canteen
