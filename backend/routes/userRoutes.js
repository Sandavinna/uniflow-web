const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getRegistrationRequests,
  approveRegistration,
  rejectRegistration,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/registration-requests', protect, authorize('admin'), getRegistrationRequests);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.put('/registration-requests/:id/approve', protect, authorize('admin'), approveRegistration);
router.put('/registration-requests/:id/reject', protect, authorize('admin'), rejectRegistration);
router.post('/:id/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

