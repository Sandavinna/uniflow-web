const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  createMedicalRecord,
  getMedicalRecords,
} = require('../controllers/medicalController');
const {
  updateAvailability,
  getAvailability,
  getAvailabilityStatus,
} = require('../controllers/medicalStaffController');
const { protect, authorize } = require('../middleware/auth');

router.post('/appointments', protect, authorize('student'), createAppointment);
router.get('/appointments', protect, getAppointments);
router.put('/appointments/:id', protect, updateAppointment);
router.post('/records', protect, authorize('admin'), createMedicalRecord);
router.get('/records', protect, getMedicalRecords);

// Medical staff availability routes
router.put('/staff/availability', protect, authorize('medical_staff'), updateAvailability);
router.get('/staff/availability', protect, getAvailability);
router.get('/staff/status', protect, getAvailabilityStatus);

module.exports = router;

