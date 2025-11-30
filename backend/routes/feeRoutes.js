const express = require('express');
const router = express.Router();
const {
  createFee,
  getFees,
  payFee,
  deleteFee,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

router.post('/', protect, authorize('admin'), auditLog('FEE_CREATE', 'Fee'), createFee);
router.get('/', protect, getFees);
router.put('/:id/pay', protect, auditLog('FEE_PAY', 'Fee'), payFee);
router.delete('/:id', protect, authorize('admin'), auditLog('FEE_DELETE', 'Fee'), deleteFee);

module.exports = router;


