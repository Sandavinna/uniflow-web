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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('student', 'name studentId email phone')
      .populate('createdBy', 'name email')
      .sort({ appointmentDate: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: appointments,
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

// @desc    Update appointment
// @route   PUT /api/medical/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Admin can update any appointment
    // Students can only update their own appointments if not completed
    if (req.user.role !== 'admin') {
      if (req.user.role === 'student' && appointment.student.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (req.user.role === 'student' && appointment.status === 'completed') {
        return res.status(400).json({ message: 'Cannot update completed appointment' });
      }
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

// @desc    Delete appointment
// @route   DELETE /api/medical/appointments/:id
// @access  Private (Admin, Medical Staff, Student - own appointments)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Admin can delete any appointment
    // Students can only delete their own appointments
    if (req.user.role !== 'admin' && req.user.role !== 'medical_staff') {
      if (req.user.role === 'student' && appointment.student.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('student', 'name studentId email')
      .populate('createdBy', 'name email role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: records,
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

// @desc    Update medical record
// @route   PUT /api/medical/records/:id
// @access  Private (Admin, Medical Staff)
exports.updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Admin can update any record
    // Medical staff can only update records they created
    if (req.user.role !== 'admin') {
      if (req.user.role === 'medical_staff' && record.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const updated = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student', 'name studentId email')
     .populate('createdBy', 'name email role');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/medical/records/:id
// @access  Private (Admin, Medical Staff - own records)
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Admin can delete any record
    // Medical staff can only delete records they created
    if (req.user.role !== 'admin') {
      if (req.user.role === 'medical_staff' && record.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await record.deleteOne();
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};










