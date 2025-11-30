const express = require('express');
const router = express.Router();
const {
  createGrade,
  getGrades,
  getGPA,
  updateGrade,
  deleteGrade,
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

router.post('/', protect, authorize('admin', 'lecturer'), auditLog('GRADE_CREATE', 'Grade'), createGrade);
router.get('/', protect, getGrades);
router.get('/gpa/:studentId?', protect, getGPA);
router.put('/:id', protect, authorize('admin', 'lecturer'), auditLog('GRADE_UPDATE', 'Grade'), updateGrade);
router.delete('/:id', protect, authorize('admin', 'lecturer'), auditLog('GRADE_DELETE', 'Grade'), deleteGrade);

module.exports = router;


