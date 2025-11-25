const MedicalStaffAvailability = require('../models/MedicalStaff');

// @desc    Update medical staff availability
// @route   PUT /api/medical/staff/availability
// @access  Private (Medical Staff)
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, availableFrom, availableTo, currentStatus, notes } = req.body;

    let availability = await MedicalStaffAvailability.findOne({ staff: req.user.id });

    if (!availability) {
      availability = await MedicalStaffAvailability.create({
        staff: req.user.id,
        isAvailable,
        availableFrom: availableFrom || '09:00',
        availableTo: availableTo || '17:00',
        currentStatus: currentStatus || (isAvailable ? 'available' : 'off_duty'),
        notes,
      });
    } else {
      availability.isAvailable = isAvailable !== undefined ? isAvailable : availability.isAvailable;
      availability.availableFrom = availableFrom || availability.availableFrom;
      availability.availableTo = availableTo || availability.availableTo;
      availability.currentStatus = currentStatus || availability.currentStatus;
      availability.notes = notes !== undefined ? notes : availability.notes;
      availability.lastUpdated = new Date();
      await availability.save();
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get medical staff availability
// @route   GET /api/medical/staff/availability
// @access  Private
exports.getAvailability = async (req, res) => {
  try {
    let query = {};

    // Medical staff can see only their own availability
    if (req.user.role === 'medical_staff') {
      query.staff = req.user.id;
    }

    const availability = await MedicalStaffAvailability.find(query)
      .populate('staff', 'name email phone')
      .sort({ lastUpdated: -1 });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current medical staff availability status (for students)
// @route   GET /api/medical/staff/status
// @access  Private
exports.getAvailabilityStatus = async (req, res) => {
  try {
    const availability = await MedicalStaffAvailability.find({ isAvailable: true })
      .populate('staff', 'name email phone')
      .sort({ lastUpdated: -1 });

    const availableCount = availability.filter(
      (a) => a.currentStatus === 'available' && a.isAvailable
    ).length;

    res.json({
      isAvailable: availableCount > 0,
      availableCount,
      staff: availability.map((a) => ({
        name: a.staff.name,
        status: a.currentStatus,
        availableFrom: a.availableFrom,
        availableTo: a.availableTo,
        notes: a.notes,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

