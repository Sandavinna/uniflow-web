const Notice = require('../models/Notice');
const path = require('path');
const fs = require('fs');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    let query = { isActive: true };

    // Filter by target audience
    if (req.user.role !== 'admin') {
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: req.user.role },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Notice.countDocuments(query);
    const notices = await Notice.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: notices,
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

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name email role');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private (All roles except students)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience } = req.body;
    
    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/noticeImages/${req.file.filename}`;
    }

    const noticeData = {
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      targetAudience: Array.isArray(targetAudience) ? targetAudience : [targetAudience || 'all'],
      createdBy: req.user.id,
    };

    if (imagePath) {
      noticeData.image = imagePath;
    }

    const notice = await Notice.create(noticeData);
    const populatedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'name email role');
    
    res.status(201).json(populatedNotice);
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (All roles except students)
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (req.user.role !== 'admin' && notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category, priority, targetAudience } = req.body;
    
    // Handle image upload
    let imagePath = notice.image; // Keep existing image if no new one uploaded
    if (req.file) {
      // Delete old image if it exists
      if (notice.image) {
        const oldImagePath = path.join(__dirname, '..', notice.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/noticeImages/${req.file.filename}`;
    }

    const updateData = {
      title,
      content,
      category,
      priority,
      targetAudience: Array.isArray(targetAudience) ? targetAudience : [targetAudience || 'all'],
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');
    
    res.json(updatedNotice);
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (All roles except students)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (req.user.role !== 'admin' && notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated image file if it exists
    if (notice.image) {
      const imagePath = path.join(__dirname, '..', notice.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await notice.deleteOne();
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};










