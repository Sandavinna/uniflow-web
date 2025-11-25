const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
  },
  amenities: [{
    type: String,
  }],
  monthlyRent: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  occupants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hostel', hostelSchema);





