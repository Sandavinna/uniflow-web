const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourse);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);
router.post('/:id/unenroll', protect, authorize('student'), unenrollFromCourse);

module.exports = router;

