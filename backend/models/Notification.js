const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'system'],
    default: 'info',
  },
  category: {
    type: String,
    enum: ['attendance', 'course', 'fee', 'grade', 'notice', 'hostel', 'medical', 'canteen', 'system'],
  },
  relatedResource: {
    type: String, // e.g., 'Course', 'Fee', 'Grade'
  },
  relatedResourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  actionUrl: {
    type: String, // URL to navigate when notification is clicked
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);


