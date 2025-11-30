const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const uploadNotice = require('../middleware/uploadNotice');

router.get('/', protect, getNotices);
router.get('/:id', protect, getNotice);
// Allow all roles except students to create notices
router.post('/', protect, (req, res, next) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ message: 'Students cannot create notices' });
  }
  next();
}, uploadNotice.single('image'), createNotice);
// Allow all roles except students to update/delete their own notices (admin can delete any)
router.put('/:id', protect, (req, res, next) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ message: 'Students cannot update notices' });
  }
  next();
}, uploadNotice.single('image'), updateNotice);
router.delete('/:id', protect, (req, res, next) => {
  if (req.user.role === 'student') {
    return res.status(403).json({ message: 'Students cannot delete notices' });
  }
  next();
}, deleteNotice);

module.exports = router;










