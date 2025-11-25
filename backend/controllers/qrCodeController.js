const QRCode = require('../models/QRCode');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const crypto = require('crypto');
const QRCodeLib = require('qrcode');
const path = require('path');
const fs = require('fs');

// @desc    Generate QR code for attendance
// @route   POST /api/attendance/qr/generate
// @access  Private (Lecturer, Admin)
exports.generateQR = async (req, res) => {
  try {
    const { courseId, duration = 60 } = req.body; // duration in minutes

    // Verify lecturer owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to generate QR for this course' });
    }

    // Deactivate previous QR codes for this course today
    await QRCode.updateMany(
      {
        course: courseId,
        date: { $gte: new Date().setHours(0, 0, 0, 0) },
        isActive: true,
      },
      { isActive: false }
    );

    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create QR code directory if it doesn't exist
    const qrCodeDir = path.join(__dirname, '../uploads/qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }

    // Generate QR code image
    const qrCodeFileName = `qr-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFileName);
    const qrCodeImagePath = `/uploads/qrcodes/${qrCodeFileName}`;

    // Generate QR code image file
    await QRCodeLib.toFile(qrCodePath, token, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.92,
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const qrCode = await QRCode.create({
      course: courseId,
      lecturer: req.user.id,
      date: new Date(),
      token,
      expiresAt,
      imagePath: qrCodeImagePath,
    });

    res.status(201).json({
      qrCode: qrCode._id,
      token: qrCode.token,
      expiresAt: qrCode.expiresAt,
      course: course.courseCode,
      imagePath: qrCode.imagePath,
      downloadUrl: `/api/attendance/qr/${qrCode._id}/download`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scan QR code and mark attendance
// @route   POST /api/attendance/qr/scan
// @access  Private (Student)
exports.scanQR = async (req, res) => {
  try {
    const { token } = req.body;

    const qrCode = await QRCode.findOne({ token, isActive: true })
      .populate('course');

    if (!qrCode) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Check if QR code is expired
    if (new Date() > qrCode.expiresAt) {
      qrCode.isActive = false;
      await qrCode.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(qrCode.course._id);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if already scanned
    const alreadyScanned = qrCode.attendanceRecords.find(
      (record) => record.student.toString() === req.user.id
    );

    if (alreadyScanned) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // Add to attendance records
    qrCode.attendanceRecords.push({
      student: req.user.id,
      scannedAt: new Date(),
    });

    // Create attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      {
        student: req.user.id,
        course: qrCode.course._id,
        date: today,
      },
      {
        student: req.user.id,
        course: qrCode.course._id,
        date: today,
        status: 'present',
        markedBy: qrCode.lecturer,
      },
      { upsert: true, new: true }
    );

    await qrCode.save();

    res.json({
      message: 'Attendance marked successfully',
      course: course.courseCode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get QR code attendance records
// @route   GET /api/attendance/qr/:qrCodeId
// @access  Private (Lecturer, Admin)
exports.getQRAttendance = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.qrCodeId)
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'name email')
      .populate('attendanceRecords.student', 'name studentId email');

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Verify lecturer owns the course
    if (req.user.role !== 'admin' && qrCode.lecturer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      qrCode: {
        _id: qrCode._id,
        course: qrCode.course,
        date: qrCode.date,
        expiresAt: qrCode.expiresAt,
        isActive: qrCode.isActive,
      },
      attendanceCount: qrCode.attendanceRecords.length,
      attendanceRecords: qrCode.attendanceRecords.map((record) => ({
        studentId: record.student.studentId,
        name: record.student.name,
        email: record.student.email,
        scannedAt: record.scannedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all QR codes for a lecturer
// @route   GET /api/attendance/qr
// @access  Private (Lecturer, Admin)
exports.getQRCodes = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query.lecturer = req.user.id;
    }

    if (req.query.course) {
      query.course = req.query.course;
    }

    const qrCodes = await QRCode.find(query)
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'name email')
      .sort({ createdAt: -1 });

    // Add download URL to each QR code
    const qrCodesWithDownload = qrCodes.map(qr => ({
      ...qr.toObject(),
      downloadUrl: `/api/attendance/qr/${qr._id}/download`,
    }));

    res.json(qrCodesWithDownload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active QR codes for student's enrolled courses
// @route   GET /api/attendance/qr/student
// @access  Private (Student)
exports.getStudentQRCodes = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Convert student ID to ObjectId for proper matching
    const studentId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;

    // Get student's enrolled courses - try both ObjectId and string matching
    let courses = await Course.find({ 
      enrolledStudents: { $in: [studentId] }
    }).select('_id courseCode courseName');
    
    // If no courses found with ObjectId, try with string
    if (courses.length === 0) {
      courses = await Course.find({ 
        enrolledStudents: req.user.id
      }).select('_id courseCode courseName');
    }
    
    const courseIds = courses.map(c => c._id.toString());
    
    console.log(`[QR Student] Student ${req.user.id} enrolled in ${courses.length} courses:`, 
      courses.map(c => c.courseCode).join(', '));

    if (courseIds.length === 0) {
      console.log(`[QR Student] No enrolled courses found for student ${req.user.id}`);
      return res.json([]);
    }

    // Get ALL active QR codes first
    const allQRCodes = await QRCode.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate('course', 'courseCode courseName')
      .populate('lecturer', 'name email')
      .sort({ createdAt: -1 });

    console.log(`[QR Student] Found ${allQRCodes.length} active QR codes total`);

    // Filter QR codes to only include those for enrolled courses
    const qrCodes = allQRCodes.filter(qr => {
      const qrCourseId = qr.course._id.toString();
      const isMatch = courseIds.includes(qrCourseId);
      if (isMatch) {
        console.log(`[QR Student] Match found: QR for course ${qr.course.courseCode}`);
      }
      return isMatch;
    });

    console.log(`[QR Student] Found ${qrCodes.length} QR codes for student's enrolled courses`);

    // Check which ones the student has already scanned
    const qrCodesWithStatus = qrCodes.map(qr => {
      const alreadyScanned = qr.attendanceRecords && qr.attendanceRecords.some(
        record => record.student && record.student.toString() === req.user.id
      );
      return {
        ...qr.toObject(),
        alreadyScanned: alreadyScanned || false,
        downloadUrl: `/api/attendance/qr/${qr._id}/download`,
      };
    });

    res.json(qrCodesWithStatus);
  } catch (error) {
    console.error('[QR Student] Error in getStudentQRCodes:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download QR code image
// @route   GET /api/attendance/qr/:qrCodeId/download
// @access  Private (Student, Lecturer, Admin)
exports.downloadQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.qrCodeId)
      .populate('course', 'courseCode courseName');

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Check if QR code is expired
    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ message: 'QR code has expired. Download link is no longer available.' });
    }

    // Check if QR code is active
    if (!qrCode.isActive) {
      return res.status(400).json({ message: 'QR code is no longer active.' });
    }

    // For students, check if they are enrolled in the course
    if (req.user.role === 'student') {
      const course = await Course.findById(qrCode.course._id);
      if (!course.enrolledStudents.includes(req.user.id)) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }
    }

    // For lecturers, check if they own the course
    if (req.user.role === 'lecturer' && qrCode.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to download this QR code' });
    }

    if (!qrCode.imagePath) {
      return res.status(404).json({ message: 'QR code image not found' });
    }

    const imagePath = path.join(__dirname, '..', qrCode.imagePath);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: 'QR code image file not found' });
    }

    // Set headers for download
    const fileName = `QR-${qrCode.course.courseCode}-${qrCode._id}.png`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'image/png');
    
    // Send file
    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    console.error('Error downloading QR code:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload and scan QR code from image
// @route   POST /api/attendance/qr/upload-scan
// @access  Private (Student)
exports.uploadAndScanQR = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Use the existing scanQR logic
    const qrCode = await QRCode.findOne({ token, isActive: true })
      .populate('course');

    if (!qrCode) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Check if QR code is expired
    if (new Date() > qrCode.expiresAt) {
      qrCode.isActive = false;
      await qrCode.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(qrCode.course._id);
    if (!course.enrolledStudents.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if already scanned
    const alreadyScanned = qrCode.attendanceRecords.find(
      (record) => record.student.toString() === req.user.id
    );

    if (alreadyScanned) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // Add to attendance records
    qrCode.attendanceRecords.push({
      student: req.user.id,
      scannedAt: new Date(),
    });

    // Create attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      {
        student: req.user.id,
        course: qrCode.course._id,
        date: today,
      },
      {
        student: req.user.id,
        course: qrCode.course._id,
        date: today,
        status: 'present',
        markedBy: qrCode.lecturer,
      },
      { upsert: true, new: true }
    );

    await qrCode.save();

    res.json({
      message: 'Attendance marked successfully',
      course: course.courseCode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

