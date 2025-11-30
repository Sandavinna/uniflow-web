const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_RESET',
      'PASSWORD_CHANGE',
      'PROFILE_UPDATE',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'COURSE_CREATE',
      'COURSE_UPDATE',
      'COURSE_DELETE',
      'ATTENDANCE_MARK',
      'ATTENDANCE_UPDATE',
      'ATTENDANCE_DELETE',
      'QR_GENERATE',
      'QR_SCAN',
      'NOTICE_CREATE',
      'NOTICE_UPDATE',
      'NOTICE_DELETE',
      'REGISTRATION_APPROVE',
      'REGISTRATION_REJECT',
      'FILE_UPLOAD',
      'FILE_DELETE',
      'OTHER',
    ],
  },
  resource: {
    type: String, // e.g., 'User', 'Course', 'Attendance'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Store additional details
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS',
  },
  errorMessage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index for efficient querying
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);


