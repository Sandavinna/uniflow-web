const Fee = require('../models/Fee');
const User = require('../models/User');
const logger = require('../utils/logger');
const auditLog = require('../middleware/auditLog');

// @desc    Create fee
// @route   POST /api/fees
// @access  Private (Admin)
exports.createFee = async (req, res) => {
  try {
    const { student, feeType, amount, dueDate, remarks } = req.body;

    if (!student || !feeType || !amount || !dueDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const fee = await Fee.create({
      student,
      feeType,
      amount,
      dueDate,
      remarks,
      createdBy: req.user.id,
      status: 'pending',
    });

    logger.info(`Fee created - Student: ${student}, Type: ${feeType}, Amount: ${amount}`);
    res.status(201).json(fee);
  } catch (error) {
    logger.error('Error creating fee:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fees
// @route   GET /api/fees
// @access  Private
exports.getFees = async (req, res) => {
  try {
    let query = {};

    // Students see only their fees
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (req.query.student) {
      query.student = req.query.student;
    }
    if (req.query.feeType) {
      query.feeType = req.query.feeType;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'name studentId email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: fees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error fetching fees:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fee payment
// @route   PUT /api/fees/:id/pay
// @access  Private (Admin, Student - own fees)
exports.payFee = async (req, res) => {
  try {
    const { paidAmount, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    // Students can only pay their own fees
    if (req.user.role === 'student' && fee.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newPaidAmount = (fee.paidAmount || 0) + (paidAmount || 0);
    const remainingAmount = fee.amount - newPaidAmount;

    let status = fee.status;
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partial';
    }

    fee.paidAmount = newPaidAmount;
    fee.status = status;
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    if (status === 'paid') {
      fee.paidAt = new Date();
    }
    await fee.save();

    logger.info(`Fee payment - Fee ID: ${req.params.id}, Paid: ${paidAmount}, Status: ${status}`);
    res.json(fee);
  } catch (error) {
    logger.error('Error processing fee payment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete fee
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    await fee.deleteOne();
    logger.info(`Fee deleted - Fee ID: ${req.params.id}`);
    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    logger.error('Error deleting fee:', error);
    res.status(500).json({ message: error.message });
  }
};


