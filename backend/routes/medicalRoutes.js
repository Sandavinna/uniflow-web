const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
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
router.delete('/appointments/:id', protect, deleteAppointment);
router.post('/records', protect, authorize('admin', 'medical_staff'), createMedicalRecord);
router.get('/records', protect, getMedicalRecords);
router.put('/records/:id', protect, authorize('admin', 'medical_staff'), updateMedicalRecord);
router.delete('/records/:id', protect, authorize('admin', 'medical_staff'), deleteMedicalRecord);

// Medical staff availability routes
router.put('/staff/availability', protect, authorize('medical_staff'), updateAvailability);
router.get('/staff/availability', protect, getAvailability);
router.get('/staff/status', protect, getAvailabilityStatus);

module.exports = router;

