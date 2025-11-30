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

/ /   @ d e s c         D o w n l o a d   a t t e n d a n c e   s h e e t   a s   P D F 
 
 / /   @ r o u t e       G E T   / a p i / a t t e n d a n c e / q r / : q r C o d e I d / p d f 
 
 / /   @ a c c e s s     P r i v a t e   ( L e c t u r e r ,   A d m i n ) 
 
 e x p o r t s . d o w n l o a d A t t e n d a n c e P D F   =   a s y n c   ( r e q ,   r e s )   = >   { 
 
     t r y   { 
 
         c o n s t   q r C o d e   =   a w a i t   Q R C o d e . f i n d B y I d ( r e q . p a r a m s . q r C o d e I d ) 
 
             . p o p u l a t e ( ' c o u r s e ' ,   ' c o u r s e C o d e   c o u r s e N a m e   y e a r   s e m e s t e r   d e p a r t m e n t ' ) 
 
             . p o p u l a t e ( ' l e c t u r e r ' ,   ' n a m e   e m a i l ' ) 
 
             . p o p u l a t e ( ' a t t e n d a n c e R e c o r d s . s t u d e n t ' ,   ' n a m e   s t u d e n t I d   e m a i l ' ) ; 
 
 
 
         i f   ( ! q r C o d e )   { 
 
             r e t u r n   r e s . s t a t u s ( 4 0 4 ) . j s o n ( {   m e s s a g e :   ' Q R   c o d e   n o t   f o u n d '   } ) ; 
 
         } 
 
 
 
         / /   V e r i f y   l e c t u r e r   o w n s   t h e   c o u r s e 
 
         i f   ( r e q . u s e r . r o l e   ! = =   ' a d m i n '   & &   q r C o d e . l e c t u r e r . _ i d . t o S t r i n g ( )   ! = =   r e q . u s e r . i d )   { 
 
             r e t u r n   r e s . s t a t u s ( 4 0 3 ) . j s o n ( {   m e s s a g e :   ' N o t   a u t h o r i z e d   t o   d o w n l o a d   t h i s   a t t e n d a n c e   s h e e t '   } ) ; 
 
         } 
 
 
 
         / /   C r e a t e   P D F   d o c u m e n t 
 
         c o n s t   d o c   =   n e w   P D F D o c u m e n t ( {   m a r g i n :   5 0   } ) ; 
 
         
 
         / /   S e t   r e s p o n s e   h e a d e r s 
 
         r e s . s e t H e a d e r ( ' C o n t e n t - T y p e ' ,   ' a p p l i c a t i o n / p d f ' ) ; 
 
         r e s . s e t H e a d e r ( 
 
             ' C o n t e n t - D i s p o s i t i o n ' , 
 
             ` a t t a c h m e n t ;   f i l e n a m e = " A t t e n d a n c e - $ { q r C o d e . c o u r s e . c o u r s e C o d e } - $ { n e w   D a t e ( q r C o d e . d a t e ) . t o I S O S t r i n g ( ) . s p l i t ( ' T ' ) [ 0 ] } . p d f " ` 
 
         ) ; 
 
 
 
         / /   P i p e   P D F   t o   r e s p o n s e 
 
         d o c . p i p e ( r e s ) ; 
 
 
 
         / /   H e a d e r 
 
         d o c . f o n t S i z e ( 2 0 ) . t e x t ( ' A t t e n d a n c e   S h e e t ' ,   {   a l i g n :   ' c e n t e r '   } ) ; 
 
         d o c . m o v e D o w n ( ) ; 
 
 
 
         / /   C o u r s e   I n f o r m a t i o n 
 
         d o c . f o n t S i z e ( 1 4 ) . t e x t ( ' C o u r s e   I n f o r m a t i o n ' ,   {   u n d e r l i n e :   t r u e   } ) ; 
 
         d o c . m o v e D o w n ( 0 . 5 ) ; 
 
         d o c . f o n t S i z e ( 1 2 ) ; 
 
         d o c . t e x t ( ` C o u r s e   C o d e :   $ { q r C o d e . c o u r s e . c o u r s e C o d e } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` C o u r s e   N a m e :   $ { q r C o d e . c o u r s e . c o u r s e N a m e } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` Y e a r :   $ { q r C o d e . c o u r s e . y e a r } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` S e m e s t e r :   $ { q r C o d e . c o u r s e . s e m e s t e r } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` D e p a r t m e n t :   $ { q r C o d e . c o u r s e . d e p a r t m e n t   | |   ' N / A ' } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . m o v e D o w n ( ) ; 
 
 
 
         / /   L e c t u r e r   I n f o r m a t i o n 
 
         d o c . t e x t ( ` L e c t u r e r :   $ { q r C o d e . l e c t u r e r . n a m e } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` E m a i l :   $ { q r C o d e . l e c t u r e r . e m a i l } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . m o v e D o w n ( ) ; 
 
 
 
         / /   Q R   C o d e   D e t a i l s 
 
         d o c . t e x t ( ` D a t e :   $ { n e w   D a t e ( q r C o d e . d a t e ) . t o L o c a l e D a t e S t r i n g ( ) } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` Q R   C o d e   G e n e r a t e d :   $ { n e w   D a t e ( q r C o d e . d a t e ) . t o L o c a l e S t r i n g ( ) } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` Q R   C o d e   E x p i r e d :   $ { n e w   D a t e ( q r C o d e . e x p i r e s A t ) . t o L o c a l e S t r i n g ( ) } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . t e x t ( ` S t a t u s :   $ { q r C o d e . i s A c t i v e   ?   ' A c t i v e '   :   ' E x p i r e d ' } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . m o v e D o w n ( ) ; 
 
 
 
         / /   A t t e n d a n c e   S u m m a r y 
 
         d o c . f o n t S i z e ( 1 4 ) . t e x t ( ' A t t e n d a n c e   S u m m a r y ' ,   {   u n d e r l i n e :   t r u e   } ) ; 
 
         d o c . m o v e D o w n ( 0 . 5 ) ; 
 
         d o c . f o n t S i z e ( 1 2 ) ; 
 
         d o c . t e x t ( ` T o t a l   S t u d e n t s   P r e s e n t :   $ { q r C o d e . a t t e n d a n c e R e c o r d s . l e n g t h } ` ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         d o c . m o v e D o w n ( ) ; 
 
 
 
         / /   A t t e n d a n c e   R e c o r d s   T a b l e 
 
         i f   ( q r C o d e . a t t e n d a n c e R e c o r d s . l e n g t h   >   0 )   { 
 
             d o c . f o n t S i z e ( 1 4 ) . t e x t ( ' A t t e n d a n c e   R e c o r d s ' ,   {   u n d e r l i n e :   t r u e   } ) ; 
 
             d o c . m o v e D o w n ( 0 . 5 ) ; 
 
 
 
             / /   T a b l e   h e a d e r 
 
             c o n s t   t a b l e T o p   =   d o c . y ; 
 
             c o n s t   i t e m H e i g h t   =   2 0 ; 
 
             c o n s t   p a g e W i d t h   =   d o c . p a g e . w i d t h   -   1 0 0 ; 
 
             c o n s t   c o l W i d t h s   =   { 
 
                 n o :   4 0 , 
 
                 s t u d e n t I d :   1 2 0 , 
 
                 n a m e :   2 0 0 , 
 
                 s c a n n e d A t :   1 5 0 , 
 
             } ; 
 
 
 
             / /   H e a d e r   r o w 
 
             d o c . f o n t S i z e ( 1 0 ) . f o n t ( ' H e l v e t i c a - B o l d ' ) ; 
 
             d o c . t e x t ( ' N o . ' ,   5 0 ,   t a b l e T o p ,   {   w i d t h :   c o l W i d t h s . n o   } ) ; 
 
             d o c . t e x t ( ' S t u d e n t   I D ' ,   5 0   +   c o l W i d t h s . n o ,   t a b l e T o p ,   {   w i d t h :   c o l W i d t h s . s t u d e n t I d   } ) ; 
 
             d o c . t e x t ( ' N a m e ' ,   5 0   +   c o l W i d t h s . n o   +   c o l W i d t h s . s t u d e n t I d ,   t a b l e T o p ,   {   w i d t h :   c o l W i d t h s . n a m e   } ) ; 
 
             d o c . t e x t ( ' S c a n n e d   A t ' ,   5 0   +   c o l W i d t h s . n o   +   c o l W i d t h s . s t u d e n t I d   +   c o l W i d t h s . n a m e ,   t a b l e T o p ,   {   w i d t h :   c o l W i d t h s . s c a n n e d A t   } ) ; 
 
 
 
             / /   D r a w   h e a d e r   l i n e 
 
             d o c . m o v e T o ( 5 0 ,   t a b l e T o p   +   1 5 ) . l i n e T o ( p a g e W i d t h   +   5 0 ,   t a b l e T o p   +   1 5 ) . s t r o k e ( ) ; 
 
 
 
             / /   D a t a   r o w s 
 
             d o c . f o n t ( ' H e l v e t i c a ' ) . f o n t S i z e ( 1 0 ) ; 
 
             l e t   y   =   t a b l e T o p   +   2 5 ; 
 
             
 
             q r C o d e . a t t e n d a n c e R e c o r d s . f o r E a c h ( ( r e c o r d ,   i n d e x )   = >   { 
 
                 / /   C h e c k   i f   w e   n e e d   a   n e w   p a g e 
 
                 i f   ( y   >   d o c . p a g e . h e i g h t   -   1 0 0 )   { 
 
                     d o c . a d d P a g e ( ) ; 
 
                     y   =   5 0 ; 
 
                 } 
 
 
 
                 d o c . t e x t ( ( i n d e x   +   1 ) . t o S t r i n g ( ) ,   5 0 ,   y ,   {   w i d t h :   c o l W i d t h s . n o   } ) ; 
 
                 d o c . t e x t ( r e c o r d . s t u d e n t ? . s t u d e n t I d   | |   ' N / A ' ,   5 0   +   c o l W i d t h s . n o ,   y ,   {   w i d t h :   c o l W i d t h s . s t u d e n t I d   } ) ; 
 
                 d o c . t e x t ( r e c o r d . s t u d e n t ? . n a m e   | |   ' N / A ' ,   5 0   +   c o l W i d t h s . n o   +   c o l W i d t h s . s t u d e n t I d ,   y ,   {   w i d t h :   c o l W i d t h s . n a m e   } ) ; 
 
                 d o c . t e x t ( n e w   D a t e ( r e c o r d . s c a n n e d A t ) . t o L o c a l e S t r i n g ( ) ,   5 0   +   c o l W i d t h s . n o   +   c o l W i d t h s . s t u d e n t I d   +   c o l W i d t h s . n a m e ,   y ,   {   w i d t h :   c o l W i d t h s . s c a n n e d A t   } ) ; 
 
 
 
                 / /   D r a w   r o w   l i n e 
 
                 d o c . m o v e T o ( 5 0 ,   y   +   1 5 ) . l i n e T o ( p a g e W i d t h   +   5 0 ,   y   +   1 5 ) . s t r o k e ( ) ; 
 
                 y   + =   i t e m H e i g h t ; 
 
             } ) ; 
 
         }   e l s e   { 
 
             d o c . f o n t S i z e ( 1 2 ) . t e x t ( ' N o   a t t e n d a n c e   r e c o r d s   f o u n d . ' ,   {   c o n t i n u e d :   f a l s e   } ) ; 
 
         } 
 
 
 
         / /   F o o t e r 
 
         d o c . f o n t S i z e ( 8 ) . t e x t ( 
 
             ` G e n e r a t e d   o n :   $ { n e w   D a t e ( ) . t o L o c a l e S t r i n g ( ) } ` , 
 
             5 0 , 
 
             d o c . p a g e . h e i g h t   -   5 0 , 
 
             {   a l i g n :   ' c e n t e r '   } 
 
         ) ; 
 
 
 
         / /   F i n a l i z e   P D F 
 
         d o c . e n d ( ) ; 
 
     }   c a t c h   ( e r r o r )   { 
 
         c o n s o l e . e r r o r ( ' E r r o r   g e n e r a t i n g   P D F : ' ,   e r r o r ) ; 
 
         r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   m e s s a g e :   e r r o r . m e s s a g e   } ) ; 
 
     } 
 
 } ; 
 
 
 
 
