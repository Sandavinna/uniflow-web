const { MenuItem, Order } = require('../models/Canteen');

// @desc    Get all menu items
// @route   GET /api/canteen/menu
// @access  Private
exports.getMenu = async (req, res) => {
  try {
    let query = {};

    // Admin and canteen staff can see all items (including unavailable)
    // Students see only available items
    if (req.user.role === 'student') {
      query.isAvailable = true;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const menu = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/canteen/menu
// @access  Private (Admin)
exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/canteen/menu/:id
// @access  Private (Admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/canteen/menu/:id
// @access  Private (Admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/canteen/orders
// @access  Private (Student)
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, specialInstructions } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not available` });
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    const order = await Order.create({
      student: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      specialInstructions,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders
// @route   GET /api/canteen/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    // Students see only their orders
    // Admin and canteen staff see all orders
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('student', 'name studentId email')
      .populate('items.menuItem', 'name price')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/canteen/orders/:id
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'delivered' && { deliveryTime: new Date() }) },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

