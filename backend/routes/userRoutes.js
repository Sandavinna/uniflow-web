const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.post('/:id/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

