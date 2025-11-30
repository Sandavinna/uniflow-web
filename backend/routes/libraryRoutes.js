const express = require('express');
const router = express.Router();
const {
  getBooks,
  createBook,
  borrowBook,
  returnBook,
  getBorrowings,
} = require('../controllers/libraryController');
const { protect, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

router.get('/books', protect, getBooks);
router.post('/books', protect, authorize('admin'), auditLog('BOOK_CREATE', 'Book'), createBook);
router.post('/books/:id/borrow', protect, authorize('student'), auditLog('BOOK_BORROW', 'Book'), borrowBook);
router.get('/borrowings', protect, getBorrowings);
router.post('/borrowings/:id/return', protect, auditLog('BOOK_RETURN', 'Book'), returnBook);

module.exports = router;


