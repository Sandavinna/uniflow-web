const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feeType: {
    type: String,
    enum: ['tuition', 'hostel', 'library', 'lab', 'sports', 'examination', 'other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial', 'waived'],
    default: 'pending',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  paidAt: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'online', 'cheque', 'other'],
  },
  transactionId: {
    type: String,
  },
  receiptNumber: {
    type: String,
  },
  remarks: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Fee', feeSchema);


