const QRCode = require('../models/QRCode');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const crypto = require('crypto');
const QRCodeLib = require('qrcode');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// @desc    Generate QR code for attendance
// @route   POST /api/attendance/qr/generate
// @access  Private (Lecturer, Admin)
exports.generateQR = async (req, res) => {
  try {
    const { courseId, year, semester, courseCode, courseName, duration = 60 } = req.body; // duration in minutes

    let course;

    // For lecturers: use year, semester, courseCode, courseName to find or create course
    if (req.user.role === 'lecturer' && year && semester && courseCode && courseName) {
      // Verify lecturer has this course in their lecturerCourses
      const lecturer = await require('../models/User').findById(req.user.id);
      if (!lecturer || !lecturer.lecturerCourses) {
        return res.status(403).json({ message: 'Lecturer courses not found. Please contact administrator.' });
      }

      const yearData = lecturer.lecturerCourses.find(y => y.year === year);
      if (!yearData) {
        return res.status(403).json({ message: `You are not assigned to teach ${year}` });
      }

      const courseData = yearData.courses.find(c => c.courseCode === courseCode && c.courseName === courseName);
      if (!courseData) {
        return res.status(403).json({ message: 'You are not assigned to teach this course' });
      }

      // Find or create the course
      course = await Course.findOne({
        courseCode: courseCode,
        lecturer: req.user.id,
        year: year,
        semester: semester,
      });

      if (!course) {
        // Create the course if it doesn't exist
        course = await Course.create({
          courseCode: courseCode,
          courseName: courseName,
          lecturer: req.user.id,
          department: lecturer.department || 'General',
          credits: 3, // Default credits, can be updated later
          year: year,
          semester: semester,
        });
      }
    } else if (courseId) {
      // For admins: use courseId (backward compatibility)
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (req.user.role !== 'admin' && course.lecturer.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to generate QR for this course' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid request. Provide either courseId (admin) or year, semester, courseCode, courseName (lecturer)' });
    }

    // Deactivate previous QR codes for this course today
    await QRCode.updateMany(
      {
        course: course._id,
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
      course: course._id,
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
    const isEnrolled = course.enrolledStudents.some(
      id => id.toString() === req.user.id
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if already scanned
    const alreadyScanned = qrCode.attendanceRecords.find(
      (record) => record.student && record.student.toString() === req.user.id
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
    const logger = require('../utils/logger');
    
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
    
    logger.debug(`QR Student - Student ${req.user.id} enrolled in ${courses.length} courses`);

    if (courseIds.length === 0) {
      logger.debug(`QR Student - No enrolled courses found for student ${req.user.id}`);
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

    logger.debug(`QR Student - Found ${allQRCodes.length} active QR codes total`);

    // Filter QR codes to only include those for enrolled courses
    const qrCodes = allQRCodes.filter(qr => {
      const qrCourseId = qr.course._id.toString();
      const isMatch = courseIds.includes(qrCourseId);
      // Match found - log if needed
      return isMatch;
    });

    logger.debug(`QR Student - Found ${qrCodes.length} QR codes for student's enrolled courses`);

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
      const isEnrolled = course.enrolledStudents.some(
        id => id.toString() === req.user.id
      );
      if (!isEnrolled) {
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
    const isEnrolled = course.enrolledStudents.some(
      id => id.toString() === req.user.id
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if already scanned
    const alreadyScanned = qrCode.attendanceRecords.find(
      (record) => record.student && record.student.toString() === req.user.id
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

// @desc    Download attendance sheet as PDF
// @route   GET /api/attendance/qr/:qrCodeId/pdf
// @access  Private (Lecturer, Admin)
exports.downloadAttendancePDF = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.qrCodeId)
      .populate('course', 'courseCode courseName year semester department')
      .populate('lecturer', 'name email')
      .populate('attendanceRecords.student', 'name studentId email');

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Verify lecturer owns the course
    if (req.user.role !== 'admin' && qrCode.lecturer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to download this attendance sheet' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Attendance-${qrCode.course.courseCode}-${new Date(qrCode.date).toISOString().split('T')[0]}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Attendance Sheet', { align: 'center' });
    doc.moveDown();

    // Course Information
    doc.fontSize(14).text('Course Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Course Code: ${qrCode.course.courseCode}`, { continued: false });
    doc.text(`Course Name: ${qrCode.course.courseName}`, { continued: false });
    doc.text(`Year: ${qrCode.course.year}`, { continued: false });
    doc.text(`Semester: ${qrCode.course.semester}`, { continued: false });
    doc.text(`Department: ${qrCode.course.department || 'N/A'}`, { continued: false });
    doc.moveDown();

    // Lecturer Information
    doc.text(`Lecturer: ${qrCode.lecturer.name}`, { continued: false });
    doc.text(`Email: ${qrCode.lecturer.email}`, { continued: false });
    doc.moveDown();

    // QR Code Details
    doc.text(`Date: ${new Date(qrCode.date).toLocaleDateString()}`, { continued: false });
    doc.text(`QR Code Generated: ${new Date(qrCode.date).toLocaleString()}`, { continued: false });
    doc.text(`QR Code Expired: ${new Date(qrCode.expiresAt).toLocaleString()}`, { continued: false });
    doc.text(`Status: ${qrCode.isActive ? 'Active' : 'Expired'}`, { continued: false });
    doc.moveDown();

    // Attendance Summary
    doc.fontSize(14).text('Attendance Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Students Present: ${qrCode.attendanceRecords.length}`, { continued: false });
    doc.moveDown();

    // Attendance Records Table
    if (qrCode.attendanceRecords.length > 0) {
      doc.fontSize(14).text('Attendance Records', { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const itemHeight = 20;
      const pageWidth = doc.page.width - 100;
      const colWidths = {
        no: 40,
        studentId: 120,
        name: 200,
        scannedAt: 150,
      };

      // Header row
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('No.', 50, tableTop, { width: colWidths.no });
      doc.text('Student ID', 50 + colWidths.no, tableTop, { width: colWidths.studentId });
      doc.text('Name', 50 + colWidths.no + colWidths.studentId, tableTop, { width: colWidths.name });
      doc.text('Scanned At', 50 + colWidths.no + colWidths.studentId + colWidths.name, tableTop, { width: colWidths.scannedAt });

      // Draw header line
      doc.moveTo(50, tableTop + 15).lineTo(pageWidth + 50, tableTop + 15).stroke();

      // Data rows
      doc.font('Helvetica').fontSize(10);
      let y = tableTop + 25;
      
      qrCode.attendanceRecords.forEach((record, index) => {
        // Check if we need a new page
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }

        doc.text((index + 1).toString(), 50, y, { width: colWidths.no });
        doc.text(record.student?.studentId || 'N/A', 50 + colWidths.no, y, { width: colWidths.studentId });
        doc.text(record.student?.name || 'N/A', 50 + colWidths.no + colWidths.studentId, y, { width: colWidths.name });
        doc.text(new Date(record.scannedAt).toLocaleString(), 50 + colWidths.no + colWidths.studentId + colWidths.name, y, { width: colWidths.scannedAt });

        // Draw row line
        doc.moveTo(50, y + 15).lineTo(pageWidth + 50, y + 15).stroke();
        y += itemHeight;
      });
    } else {
      doc.fontSize(12).text('No attendance records found.', { continued: false });
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on: ${new Date().toLocaleString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete QR code
// @route   DELETE /api/attendance/qr/:qrCodeId
// @access  Private (Admin, Lecturer - own QR codes)
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.qrCodeId)
      .populate('lecturer', '_id');

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Admin can delete any QR code
    // Lecturer can only delete their own QR codes
    if (req.user.role !== 'admin') {
      if (req.user.role === 'lecturer' && qrCode.lecturer._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this QR code' });
      }
    }

    // Delete QR code image file if it exists
    if (qrCode.qrCodeImage) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', qrCode.qrCodeImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await qrCode.deleteOne();
    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

