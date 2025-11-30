const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let query = {};

    // If user is a student, filter courses by their academic year
    if (req.user.role === 'student') {
      // Get the student's academic year
      const student = await User.findById(req.user.id).select('academicYear');
      
      if (student && student.academicYear) {
        query.year = student.academicYear;
        console.log(`[Courses] Filtering courses for student ${req.user.id} - Academic Year: ${student.academicYear}`);
      } else {
        // If student doesn't have academic year set, return empty array
        console.log(`[Courses] Student ${req.user.id} doesn't have academic year set`);
        return res.json([]);
      }
    }

    // If user is a lecturer, filter courses by lecturer
    if (req.user.role === 'lecturer') {
      query.lecturer = req.user.id;
      console.log(`[Courses] Filtering courses for lecturer ${req.user.id}`);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { courseCode: { $regex: req.query.search, $options: 'i' } },
        { courseName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('lecturer', 'name email')
      .populate('enrolledStudents', 'name studentId email')
      .sort({ year: 1, semester: 1, courseCode: 1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      data: courses,
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lecturer', 'name email')
      .populate('enrolledStudents', 'name studentId email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If user is a student, check if the course matches their academic year
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id).select('academicYear');
      
      if (student && student.academicYear && course.year !== student.academicYear) {
        return res.status(403).json({ 
          message: 'You can only access courses for your academic year' 
        });
      }
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin only)
exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create courses' });
    }

    const course = await Course.create({
      ...req.body,
      lecturer: req.body.lecturer, // Admin must specify lecturer
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
exports.updateCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update courses' });
    }

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin, Lecturer - own courses only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Admin can delete any course
    // Lecturer can only delete their own courses
    if (req.user.role !== 'admin') {
      if (req.user.role === 'lecturer') {
        if (course.lecturer.toString() !== req.user.id) {
          return res.status(403).json({ message: 'You can only delete your own courses' });
        }
      } else {
        return res.status(403).json({ message: 'Not authorized to delete courses' });
      }
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollInCourse = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course matches student's academic year
    const student = await User.findById(req.user.id).select('academicYear');
    if (student && student.academicYear && course.year !== student.academicYear) {
      return res.status(403).json({ 
        message: 'You can only enroll in courses for your academic year' 
      });
    }

    // Convert to ObjectId for proper comparison
    const studentId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;

    // Check if already enrolled (handle both ObjectId and string comparison)
    const isEnrolled = course.enrolledStudents.some(
      id => id.toString() === req.user.id || id.toString() === studentId.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student ID (Mongoose will handle ObjectId conversion)
    course.enrolledStudents.push(studentId);
    await course.save();
    
    console.log(`Student ${req.user.id} enrolled in course ${course.courseCode}`);
    res.json(course);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Student)
exports.unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.user.id
    );
    await course.save();
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

