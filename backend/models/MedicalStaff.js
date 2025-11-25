const mongoose = require('mongoose');

const medicalStaffAvailabilitySchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  availableFrom: {
    type: String, // Time format: "HH:MM"
    default: '09:00',
  },
  availableTo: {
    type: String, // Time format: "HH:MM"
    default: '17:00',
  },
  currentStatus: {
    type: String,
    enum: ['available', 'busy', 'off_duty'],
    default: 'off_duty',
  },
  notes: {
    type: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalStaffAvailability', medicalStaffAvailabilitySchema);





