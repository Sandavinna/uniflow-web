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
} = require('../controllers/canteenController');
const { protect, authorize } = require('../middleware/auth');

router.get('/menu', protect, getMenu);
router.post('/menu', protect, authorize('admin', 'canteen_staff'), createMenuItem);
router.put('/menu/:id', protect, authorize('admin', 'canteen_staff'), updateMenuItem);
router.delete('/menu/:id', protect, authorize('admin', 'canteen_staff'), deleteMenuItem);
router.post('/orders', protect, authorize('student'), createOrder);
router.get('/orders', protect, getOrders);
router.put('/orders/:id', protect, authorize('admin', 'canteen_staff'), updateOrderStatus);

module.exports = router;

