const express = require('express');
const router = express.Router();
const {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  allocateRoom,
  checkoutRoom,
  getStudentHostel,
  deleteHostel,
} = require('../controllers/hostelController');
const {
  sendMessage,
  getMessages,
  replyToMessage,
  deleteMessage,
} = require('../controllers/hostelMessageController');
const {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: Specific routes must come before parameterized routes (/:id)
// Otherwise, Express will match /maintenance and /messages to /:id

// Messaging routes (must be before /:id)
router.post('/messages', protect, authorize('student'), sendMessage);
router.get('/messages', protect, getMessages);
router.put('/messages/:id/reply', protect, authorize('admin', 'hostel_admin'), replyToMessage);
router.delete('/messages/:id', protect, deleteMessage); // Controller checks role: admin, hostel_admin, or student (own)

// Maintenance routes (must be before /:id)
router.post('/maintenance', protect, authorize('student'), createRequest);
router.get('/maintenance', protect, getRequests);
router.put('/maintenance/:id', protect, authorize('admin', 'hostel_admin'), updateRequest);
router.delete('/maintenance/:id', protect, deleteRequest); // Controller checks role: admin, hostel_admin, or student (own)

// Student hostel route (must be before /:id)
router.get('/student/:studentId?', protect, getStudentHostel);

// Hostel room routes
router.get('/', protect, getHostels);
router.post('/', protect, authorize('admin', 'hostel_admin'), createHostel);
router.get('/:id', protect, getHostel);
router.put('/:id', protect, authorize('admin', 'hostel_admin'), updateHostel);
router.delete('/:id', protect, authorize('admin', 'hostel_admin'), deleteHostel);
router.post('/:id/allocate', protect, authorize('admin', 'hostel_admin'), allocateRoom);
router.post('/:id/checkout', protect, authorize('admin', 'hostel_admin'), checkoutRoom);

module.exports = router;

