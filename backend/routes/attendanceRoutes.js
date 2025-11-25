const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const {
  generateQR,
  scanQR,
  getQRAttendance,
  getQRCodes,
  getStudentQRCodes,
  downloadQRCode,
  uploadAndScanQR,
} = require('../controllers/qrCodeController');
const { protect, authorize } = require('../middleware/auth');

// Manual attendance routes
router.post('/', protect, authorize('admin', 'lecturer'), markAttendance);
router.get('/', protect, getAttendance);
router.get('/stats', protect, getAttendanceStats);
router.put('/:id', protect, authorize('admin', 'lecturer'), updateAttendance);
router.delete('/:id', protect, authorize('admin'), deleteAttendance);

// QR code attendance routes
router.post('/qr/generate', protect, authorize('admin', 'lecturer'), generateQR);
router.post('/qr/scan', protect, authorize('student'), scanQR);
router.post('/qr/upload-scan', protect, authorize('student'), uploadAndScanQR);
router.get('/qr/student', protect, authorize('student'), getStudentQRCodes);
router.get('/qr', protect, authorize('admin', 'lecturer'), getQRCodes);
router.get('/qr/:qrCodeId/download', protect, downloadQRCode);
router.get('/qr/:qrCodeId', protect, authorize('admin', 'lecturer'), getQRAttendance);

module.exports = router;

