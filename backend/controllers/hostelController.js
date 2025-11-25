const Hostel = require('../models/Hostel');

// @desc    Get all hostels/rooms
// @route   GET /api/hostel
// @access  Private
exports.getHostels = async (req, res) => {
  try {
    let query = {};

    if (req.query.block) {
      query.block = req.query.block;
    }
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === 'true';
    }

    const hostels = await Hostel.find(query)
      .populate('occupants.student', 'name studentId email phone');

    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single hostel room
// @route   GET /api/hostel/:id
// @access  Private
exports.getHostel = async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    // This prevents errors when routes like /maintenance or /messages are incorrectly matched
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid hostel ID format' });
    }

    const hostel = await Hostel.findById(req.params.id)
      .populate('occupants.student', 'name studentId email phone');
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel room not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create hostel room
// @route   POST /api/hostel
// @access  Private (Admin, Hostel Admin)
exports.createHostel = async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update hostel room
// @route   PUT /api/hostel/:id
// @access  Private (Admin, Hostel Admin)
exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel room not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Allocate room to student
// @route   POST /api/hostel/:id/allocate
// @access  Private (Admin, Hostel Admin)
exports.allocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel room not found' });
    }

    if (hostel.currentOccupancy >= hostel.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }

    // Check if student already has an active room
    const existingRoom = await Hostel.findOne({
      'occupants.student': studentId,
      'occupants.isActive': true,
    });

    if (existingRoom) {
      return res.status(400).json({ message: 'Student already has an allocated room' });
    }

    hostel.occupants.push({
      student: studentId,
      checkInDate: new Date(),
      isActive: true,
    });
    hostel.currentOccupancy += 1;
    hostel.isAvailable = hostel.currentOccupancy < hostel.capacity;

    await hostel.save();
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out student from room
// @route   POST /api/hostel/:id/checkout
// @access  Private (Admin, Hostel Admin)
exports.checkoutRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    const hostel = await Hostel.findById(req.params.id);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel room not found' });
    }

    const occupant = hostel.occupants.find(
      o => o.student.toString() === studentId && o.isActive
    );

    if (!occupant) {
      return res.status(404).json({ message: 'Student not found in this room' });
    }

    occupant.isActive = false;
    occupant.checkOutDate = new Date();
    hostel.currentOccupancy -= 1;
    hostel.isAvailable = true;

    await hostel.save();
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's hostel room
// @route   GET /api/hostel/student/:studentId
// @access  Private
exports.getStudentHostel = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;
    
    const hostel = await Hostel.findOne({
      'occupants.student': studentId,
      'occupants.isActive': true,
    }).populate('occupants.student', 'name studentId email phone');

    if (!hostel) {
      return res.status(404).json({ message: 'No active room allocation found' });
    }

    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

