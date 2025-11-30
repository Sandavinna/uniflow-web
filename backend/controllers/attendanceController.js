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
    
    // Filter by date - if date is provided, filter by that date
    // If no date is provided and user is student, default to today's date
    if (req.query.date) {
      const date = new Date(req.query.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (req.user.role === 'student') {
      // For students, default to today's date
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Search functionality
    if (req.query.search) {
      // Search by student name or course code
      const students = await require('../models/User').find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { studentId: { $regex: req.query.search, $options: 'i' } },
        ],
      }).select('_id');
      const studentIds = students.map(s => s._id);

      const courses = await require('../models/Course').find({
        $or: [
          { courseCode: { $regex: req.query.search, $options: 'i' } },
          { courseName: { $regex: req.query.search, $options: 'i' } },
        ],
      }).select('_id');
      const courseIds = courses.map(c => c._id);

      if (studentIds.length > 0 || courseIds.length > 0) {
        query.$or = [
          { student: { $in: studentIds } },
          { course: { $in: courseIds } },
        ];
      }
    }

    const total = await Attendance.countDocuments(query);
    
    // For admin/lecturer, use higher default limit to show more records
    // For students, keep smaller limit
    const defaultLimit = (req.user.role === 'admin' || req.user.role === 'lecturer') ? 100 : 10;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    // Fetch all matching records, populate, then sort
    let attendance = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('course', 'courseCode courseName')
      .populate('markedBy', 'name email');
    
    // Sort in JavaScript for better control with populated fields
    // Sort by: date (desc), student name (asc), course code (asc)
    attendance = attendance.sort((a, b) => {
      // First sort by date (most recent first)
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      
      // If same date, sort by student name (A-Z)
      const studentA = a.student?.name || '';
      const studentB = b.student?.name || '';
      const nameDiff = studentA.localeCompare(studentB);
      if (nameDiff !== 0) return nameDiff;
      
      // If same student, sort by course code (A-Z)
      const courseA = a.course?.courseCode || '';
      const courseB = b.course?.courseCode || '';
      return courseA.localeCompare(courseB);
    });
    
    // Apply pagination after sorting
    const paginatedAttendance = attendance.slice(skip, skip + limit);

    res.json({
      data: paginatedAttendance,
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

// @desc    Get attendance percentage for a student by course
// @route   GET /api/attendance/percentage
// @access  Private (Student, Admin, Lecturer)
exports.getAttendancePercentage = async (req, res) => {
  try {
    const { courseId } = req.query;
    const studentId = req.user.role === 'student' ? req.user.id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Get all attendance records for this student and course
    const attendanceRecords = await Attendance.find({
      student: studentId,
      course: courseId,
    }).populate('course', 'courseCode courseName');

    if (attendanceRecords.length === 0) {
      return res.json({
        course: null,
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0,
        records: [],
      });
    }

    const totalClasses = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const excused = attendanceRecords.filter(a => a.status === 'excused').length;
    
    // Calculate percentage: (present + late) / total * 100
    const percentage = totalClasses > 0
      ? ((present + late) / totalClasses * 100).toFixed(2)
      : 0;

    res.json({
      course: attendanceRecords[0].course,
      totalClasses,
      present,
      absent,
      late,
      excused,
      percentage: parseFloat(percentage),
      records: attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses with attendance percentage for a student
// @route   GET /api/attendance/percentage/all
// @access  Private (Student, Admin)
exports.getAllAttendancePercentages = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Get all courses the student is enrolled in
    const enrolledCourses = await Course.find({
      enrolledStudents: studentId,
    }).select('_id courseCode courseName year semester department');

    // Get attendance percentage for each course
    const percentages = await Promise.all(
      enrolledCourses.map(async (course) => {
        const attendanceRecords = await Attendance.find({
          student: studentId,
          course: course._id,
        });

        const totalClasses = attendanceRecords.length;
        const present = attendanceRecords.filter(a => a.status === 'present').length;
        const absent = attendanceRecords.filter(a => a.status === 'absent').length;
        const late = attendanceRecords.filter(a => a.status === 'late').length;
        const excused = attendanceRecords.filter(a => a.status === 'excused').length;
        
        const percentage = totalClasses > 0
          ? ((present + late) / totalClasses * 100).toFixed(2)
          : 0;

        return {
          course: {
            _id: course._id,
            courseCode: course.courseCode,
            courseName: course.courseName,
            year: course.year,
            semester: course.semester,
            department: course.department,
          },
          totalClasses,
          present,
          absent,
          late,
          excused,
          percentage: parseFloat(percentage),
        };
      })
    );

    res.json(percentages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};










