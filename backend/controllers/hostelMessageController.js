const HostelMessage = require('../models/HostelMessage');
const User = require('../models/User');

// @desc    Send message to sub-warden
// @route   POST /api/hostel/messages
// @access  Private (Student)
exports.sendMessage = async (req, res) => {
  try {
    // Find sub-warden (prioritize hostel_admin, then admin)
    // Note: The subWarden field is for reference only. All hostel admins can see all messages
    let subWarden = await User.findOne({ role: 'hostel_admin' });
    
    // If no hostel_admin found, try to find an admin
    if (!subWarden) {
      subWarden = await User.findOne({ role: 'admin' });
    }
    
    if (!subWarden) {
      return res.status(404).json({ message: 'Sub-warden not found. Please ensure at least one hostel admin or admin exists in the system.' });
    }

    const message = await HostelMessage.create({
      student: req.user.id,
      subWarden: subWarden._id, // Reference field - all hostel admins will see this message
      subject: req.body.subject,
      message: req.body.message,
    });

    // Populate the message before sending response
    const populatedMessage = await HostelMessage.findById(message._id)
      .populate('student', 'name studentId email')
      .populate('subWarden', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages
// @route   GET /api/hostel/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    let query = {};

    // Students see only their messages
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    // Admin and hostel_admin see all messages (no filter on student or subWarden)
    // This allows all hostel admins to see all messages, not just the assigned one
    // For hostel_admin, we don't filter by subWarden - they see all messages

    // Optional filter by student (for admin/hostel_admin)
    if ((req.user.role === 'admin' || req.user.role === 'hostel_admin') && req.query.student) {
      query.student = req.query.student;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // For hostel_admin, ensure we don't filter by subWarden - they should see all messages
    // The subWarden field is just for reference, not for filtering visibility

    console.log(`[Messages] User ${req.user.id} (${req.user.role}) fetching messages with query:`, query);

    const messages = await HostelMessage.find(query)
      .populate('student', 'name studentId email')
      .populate('subWarden', 'name email')
      .sort({ createdAt: -1 });

    console.log(`[Messages] Found ${messages.length} messages for user ${req.user.id} (${req.user.role})`);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to message
// @route   PUT /api/hostel/messages/:id/reply
// @access  Private (Admin, Hostel Admin)
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await HostelMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.reply = reply;
    message.status = 'replied';
    message.repliedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

