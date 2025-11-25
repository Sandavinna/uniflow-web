const mongoose = require('mongoose');

const hostelMessageSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subWarden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  repliedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('HostelMessage', hostelMessageSchema);





