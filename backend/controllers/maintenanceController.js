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

    console.log(`[Maintenance] User ${req.user.id} (${req.user.role}) fetching requests with query:`, query);

    const requests = await MaintenanceRequest.find(query)
      .populate('student', 'name studentId email phone')
      .populate('hostel', 'name block roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    console.log(`[Maintenance] Found ${requests.length} requests for user ${req.user.id} (${req.user.role})`);

    res.json(requests);
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

