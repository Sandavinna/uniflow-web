const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    // Removed unique constraint to allow same course code for different years/semesters/lecturers
  },
  courseName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    required: true,
  },
  semester: {
    type: String,
    enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    required: true,
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  schedule: {
    day: String,
    time: String,
    venue: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound unique index to allow same courseCode for different year/semester/lecturer combinations
// This replaces the old unique index on courseCode alone
courseSchema.index({ courseCode: 1, year: 1, semester: 1, lecturer: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);

