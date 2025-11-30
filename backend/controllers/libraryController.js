const { Book, Borrowing } = require('../models/Library');
const logger = require('../utils/logger');
const auditLog = require('../middleware/auditLog');

// @desc    Get all books
// @route   GET /api/library/books
// @access  Private
exports.getBooks = async (req, res) => {
  try {
    let query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { isbn: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: books,
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
    logger.error('Error fetching books:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create book
// @route   POST /api/library/books
// @access  Private (Admin)
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    logger.info(`Book created - ID: ${book._id}, Title: ${book.title}`);
    res.status(201).json(book);
  } catch (error) {
    logger.error('Error creating book:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Borrow book
// @route   POST /api/library/books/:id/borrow
// @access  Private (Student)
exports.borrowBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }

    // Check if student already has this book borrowed
    const existingBorrowing = await Borrowing.findOne({
      student: req.user.id,
      book: book._id,
      status: 'borrowed',
    });

    if (existingBorrowing) {
      return res.status(400).json({ message: 'You already have this book borrowed' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    const borrowing = await Borrowing.create({
      student: req.user.id,
      book: book._id,
      dueDate,
      issuedBy: req.user.id,
      status: 'borrowed',
    });

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    logger.info(`Book borrowed - Student: ${req.user.id}, Book: ${book._id}`);
    res.status(201).json(borrowing);
  } catch (error) {
    logger.error('Error borrowing book:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return book
// @route   POST /api/library/borrowings/:id/return
// @access  Private (Admin, Student - own borrowings)
exports.returnBook = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id).populate('book');
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    if (req.user.role !== 'admin' && borrowing.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Calculate fine if overdue
    let fine = 0;
    if (new Date() > borrowing.dueDate) {
      const daysOverdue = Math.ceil((new Date() - borrowing.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 10; // 10 per day fine
    }

    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    borrowing.fine = fine;
    borrowing.returnedTo = req.user.id;
    await borrowing.save();

    // Update book availability
    const book = await Book.findById(borrowing.book._id);
    book.availableCopies += 1;
    await book.save();

    logger.info(`Book returned - Borrowing ID: ${req.params.id}, Fine: ${fine}`);
    res.json(borrowing);
  } catch (error) {
    logger.error('Error returning book:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get borrowings
// @route   GET /api/library/borrowings
// @access  Private
exports.getBorrowings = async (req, res) => {
  try {
    let query = {};

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

    const total = await Borrowing.countDocuments(query);
    const borrowings = await Borrowing.find(query)
      .populate('student', 'name studentId email')
      .populate('book', 'title author isbn')
      .sort({ borrowDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: borrowings,
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
    logger.error('Error fetching borrowings:', error);
    res.status(500).json({ message: error.message });
  }
};


