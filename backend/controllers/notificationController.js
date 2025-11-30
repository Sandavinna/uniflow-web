const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const query = { user: req.user.id };

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: notifications,
      unreadCount,
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
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create notification (used by other controllers)
exports.createNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: options.type || 'info',
      category: options.category,
      relatedResource: options.resource,
      relatedResourceId: options.resourceId,
      actionUrl: options.actionUrl,
    });
    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    return null;
  }
};


