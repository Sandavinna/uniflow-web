const { Appointment, MedicalRecord } = require('../models/Medical');

// @desc    Create appointment
// @route   POST /api/medical/appointments
// @access  Private (Student)
exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      student: req.user.id,
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments
// @route   GET /api/medical/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query = {};

    // Students see only their appointments
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('student', 'name studentId email phone')
      .populate('createdBy', 'name email')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/medical/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Students can only update their own appointments if not completed
    if (req.user.role === 'student' && appointment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'student' && appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot update completed appointment' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create medical record
// @route   POST /api/medical/records
// @access  Private (Admin, Medical Staff)
exports.createMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medical records
// @route   GET /api/medical/records
// @access  Private
exports.getMedicalRecords = async (req, res) => {
  try {
    let query = {};

    // Students see only their records
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (req.query.student) {
      query.student = req.query.student;
    }
    if (req.query.recordType) {
      query.recordType = req.query.recordType;
    }

    const records = await MedicalRecord.find(query)
      .populate('student', 'name studentId email')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





