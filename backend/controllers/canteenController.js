const { MenuItem, Order } = require('../models/Canteen');
const path = require('path');
const fs = require('fs');

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
// @access  Private (Admin, Canteen Staff)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    
    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/foodImages/${req.file.filename}`;
    }

    const menuItemData = {
      name,
      description,
      price: parseFloat(price),
      category,
      isAvailable: isAvailable === 'true' || isAvailable === true,
    };

    if (imagePath) {
      menuItemData.image = imagePath;
    }

    const menuItem = await MenuItem.create(menuItemData);
    res.status(201).json(menuItem);
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

// @desc    Update menu item
// @route   PUT /api/canteen/menu/:id
// @access  Private (Admin, Canteen Staff)
exports.updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, description, price, category, isAvailable } = req.body;
    
    // Handle image upload
    let imagePath = menuItem.image; // Keep existing image if no new one uploaded
    if (req.file) {
      // Delete old image if it exists
      if (menuItem.image) {
        const oldImagePath = path.join(__dirname, '..', menuItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/foodImages/${req.file.filename}`;
    }

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      category,
      isAvailable: isAvailable === 'true' || isAvailable === true,
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedMenuItem);
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

// @desc    Delete menu item
// @route   DELETE /api/canteen/menu/:id
// @access  Private (Admin, Canteen Staff)
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete associated image file if it exists
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('student', 'name studentId email')
      .populate('items.menuItem', 'name price')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: orders,
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

// @desc    Update order status
// @route   PUT /api/canteen/orders/:id
// @access  Private (Admin, Canteen Staff)
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

// @desc    Delete order
// @route   DELETE /api/canteen/orders/:id
// @access  Private (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete orders' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

