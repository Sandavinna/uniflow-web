const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Lecturer, Admin)
exports.markAttendance = async (req, res) => {
  try {
    const { student, course, date, status, remarks } = req.body;

    // Check if attendance already marked
    const existing = await Attendance.findOne({ student, course, date });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const attendance = await Attendance.create({
      student,
      course,
      date: date || new Date(),
      status,
      remarks,
      markedBy: req.user.id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    let query = {};

    // Students can only see their own attendance
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    // Lecturers can see attendance for their courses
    if (req.user.role === 'lecturer') {
      const courses = await Course.find({ lecturer: req.user.id });
      query.course = { $in: courses.map(c => c._id) };
    }

    if (req.query.course) {
      query.course = req.query.course;
    }
    if (req.query.student) {
      query.student = req.query.student;
    }
    if (req.query.date) {
      query.date = new Date(req.query.date);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('course', 'courseCode courseName')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const { course, student } = req.query;
    const studentId = req.user.role === 'student' ? req.user.id : student;

    if (!studentId || !course) {
      return res.status(400).json({ message: 'Course and student are required' });
    }

    const attendance = await Attendance.find({ course, student: studentId });
    
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      percentage: attendance.length > 0
        ? ((attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100).toFixed(2)
        : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Lecturer, Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.deleteOne();
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





