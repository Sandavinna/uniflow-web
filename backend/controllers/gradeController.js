const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const logger = require('../utils/logger');
const auditLog = require('../middleware/auditLog');

// Calculate grade from percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  return 'F';
};

// @desc    Create grade
// @route   POST /api/grades
// @access  Private (Lecturer, Admin)
exports.createGrade = async (req, res) => {
  try {
    const { student, course, assessmentType, assessmentName, marks, maxMarks, remarks } = req.body;

    if (!student || !course || !assessmentType || !assessmentName || !marks || !maxMarks) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Verify course exists and user has permission
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && courseDoc.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to grade this course' });
    }

    const percentage = (marks / maxMarks) * 100;
    const grade = calculateGrade(percentage);

    const gradeDoc = await Grade.create({
      student,
      course,
      assessmentType,
      assessmentName,
      marks,
      maxMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
      remarks,
      gradedBy: req.user.id,
    });

    logger.info(`Grade created - Student: ${student}, Course: ${course}, Grade: ${grade}`);

    res.status(201).json(gradeDoc);
  } catch (error) {
    logger.error('Error creating grade:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grades
// @route   GET /api/grades
// @access  Private
exports.getGrades = async (req, res) => {
  try {
    let query = {};

    // Students see only their grades
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    // Lecturers see grades for their courses
    if (req.user.role === 'lecturer') {
      const courses = await Course.find({ lecturer: req.user.id });
      query.course = { $in: courses.map(c => c._id) };
    }

    if (req.query.student) {
      query.student = req.query.student;
    }
    if (req.query.course) {
      query.course = req.query.course;
    }
    if (req.query.assessmentType) {
      query.assessmentType = req.query.assessmentType;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Grade.countDocuments(query);
    const grades = await Grade.find(query)
      .populate('student', 'name studentId email')
      .populate('course', 'courseCode courseName')
      .populate('gradedBy', 'name email')
      .sort({ gradedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: grades,
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
    logger.error('Error fetching grades:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student GPA
// @route   GET /api/grades/gpa/:studentId
// @access  Private
exports.getGPA = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Get all grades for the student
    const grades = await Grade.find({ student: studentId });

    if (grades.length === 0) {
      return res.json({
        student: studentId,
        gpa: 0,
        totalCredits: 0,
        totalPoints: 0,
        courses: [],
      });
    }

    // Get course credits
    const courseIds = [...new Set(grades.map(g => g.course.toString()))];
    const courses = await Course.find({ _id: { $in: courseIds } }).select('_id credits');

    const courseCreditsMap = {};
    courses.forEach(c => {
      courseCreditsMap[c._id.toString()] = c.credits || 3; // Default to 3 credits
    });

    // Calculate GPA
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;
    const courseGPAs = {};

    grades.forEach(grade => {
      const courseId = grade.course.toString();
      const credits = courseCreditsMap[courseId] || 3;
      const points = gradePoints[grade.grade] || 0;

      if (!courseGPAs[courseId]) {
        courseGPAs[courseId] = {
          course: courseId,
          totalPoints: 0,
          totalCredits: 0,
          grades: [],
        };
      }

      courseGPAs[courseId].totalPoints += points * credits;
      courseGPAs[courseId].totalCredits += credits;
      courseGPAs[courseId].grades.push(grade);
    });

    // Calculate overall GPA
    Object.values(courseGPAs).forEach(courseGPA => {
      const courseGPAValue = courseGPA.totalCredits > 0 
        ? courseGPA.totalPoints / courseGPA.totalCredits 
        : 0;
      totalPoints += courseGPAValue * courseGPA.totalCredits;
      totalCredits += courseGPA.totalCredits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

    res.json({
      student: studentId,
      gpa: parseFloat(gpa),
      totalCredits,
      totalPoints,
      courses: Object.values(courseGPAs).map(c => ({
        course: c.course,
        gpa: (c.totalPoints / c.totalCredits).toFixed(2),
        credits: c.totalCredits,
      })),
    });
  } catch (error) {
    logger.error('Error calculating GPA:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Lecturer, Admin)
exports.updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Check authorization
    const course = await Course.findById(grade.course);
    if (req.user.role !== 'admin' && course.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { marks, maxMarks, remarks } = req.body;
    const percentage = marks && maxMarks ? (marks / maxMarks) * 100 : grade.percentage;
    const gradeLetter = calculateGrade(percentage);

    const updated = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        ...(marks && { marks }),
        ...(maxMarks && { maxMarks }),
        ...(marks && maxMarks && { percentage: parseFloat(percentage.toFixed(2)) }),
        ...(marks && maxMarks && { grade: gradeLetter }),
        ...(remarks !== undefined && { remarks }),
      },
      { new: true, runValidators: true }
    );

    logger.info(`Grade updated - Grade ID: ${req.params.id}`);
    res.json(updated);
  } catch (error) {
    logger.error('Error updating grade:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin, Lecturer - own courses)
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Check authorization
    const course = await Course.findById(grade.course);
    if (req.user.role !== 'admin' && course.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await grade.deleteOne();
    logger.info(`Grade deleted - Grade ID: ${req.params.id}`);
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    logger.error('Error deleting grade:', error);
    res.status(500).json({ message: error.message });
  }
};


