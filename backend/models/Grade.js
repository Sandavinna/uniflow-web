const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  assessmentType: {
    type: String,
    enum: ['assignment', 'quiz', 'midterm', 'final', 'project', 'lab', 'participation', 'other'],
    required: true,
  },
  assessmentName: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
  },
  remarks: {
    type: String,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1, assessmentType: 1 });

module.exports = mongoose.model('Grade', gradeSchema);


