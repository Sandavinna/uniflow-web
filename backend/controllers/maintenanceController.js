const MaintenanceRequest = require('../models/MaintenanceRequest');
const Hostel = require('../models/Hostel');

// @desc    Create maintenance request
// @route   POST /api/hostel/maintenance
// @access  Private (Student)
exports.createRequest = async (req, res) => {
  try {
    // Try to get student's hostel room (optional)
    const hostel = await Hostel.findOne({
      'occupants.student': req.user.id,
      'occupants.isActive': true,
    });

    // If room is provided in request body, use it; otherwise try to get from allocation
    let roomNumber = req.body.roomNumber;
    let hostelId = req.body.hostel;

    if (!roomNumber && hostel) {
      roomNumber = `${hostel.block}-${hostel.roomNumber}`;
      hostelId = hostel._id;
    }

    const request = await MaintenanceRequest.create({
      student: req.user.id,
      hostel: hostelId,
      roomNumber: roomNumber,
      issueType: req.body.issueType,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      images: req.body.images || [],
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get maintenance requests
// @route   GET /api/hostel/maintenance
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    let query = {};

    // Students see only their requests
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // Admin and hostel_admin see all requests (no filter on student)
    // The query will be empty for admin/hostel_admin, so all requests are returned

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.issueType) {
      query.issueType = req.query.issueType;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await MaintenanceRequest.countDocuments(query);
    const requests = await MaintenanceRequest.find(query)
      .populate('student', 'name studentId email phone')
      .populate('hostel', 'name block roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: requests,
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
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update maintenance request status
// @route   PUT /api/hostel/maintenance/:id
// @access  Private (Admin, Hostel Admin)
exports.updateRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const updated = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.status === 'completed' && { completedAt: new Date() }),
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/hostel/maintenance/:id
// @access  Private (Admin, Hostel Admin, Student - own requests)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Admin and hostel admin can delete any request
    // Students can only delete their own requests
    if (req.user.role !== 'admin' && req.user.role !== 'hostel_admin') {
      if (req.user.role === 'student' && request.student.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await request.deleteOne();
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

