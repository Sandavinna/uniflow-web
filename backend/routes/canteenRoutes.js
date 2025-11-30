const express = require('express');
const router = express.Router();
const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/canteenController');
const { protect, authorize } = require('../middleware/auth');
const uploadFood = require('../middleware/uploadFood');

router.get('/menu', protect, getMenu);
router.post('/menu', protect, authorize('admin', 'canteen_staff'), uploadFood.single('image'), createMenuItem);
router.put('/menu/:id', protect, authorize('admin', 'canteen_staff'), uploadFood.single('image'), updateMenuItem);
router.delete('/menu/:id', protect, authorize('admin', 'canteen_staff'), deleteMenuItem);
router.post('/orders', protect, authorize('student'), createOrder);
router.get('/orders', protect, getOrders);
router.put('/orders/:id', protect, authorize('admin', 'canteen_staff'), updateOrderStatus);
router.delete('/orders/:id', protect, authorize('admin'), deleteOrder);

module.exports = router;

