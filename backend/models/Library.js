const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
  },
  publicationYear: {
    type: Number,
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  location: {
    type: String, // Shelf location
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const borrowingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrowDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue', 'lost'],
    default: 'borrowed',
  },
  fine: {
    type: Number,
    default: 0,
    min: 0,
  },
  finePaid: {
    type: Boolean,
    default: false,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
borrowingSchema.index({ student: 1, status: 1 });
borrowingSchema.index({ book: 1, status: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });

const Book = mongoose.model('Book', bookSchema);
const Borrowing = mongoose.model('Borrowing', borrowingSchema);

module.exports = { Book, Borrowing };


