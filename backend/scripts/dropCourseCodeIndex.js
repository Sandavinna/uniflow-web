/**
 * Migration script to drop the old unique index on courseCode
 * Run this once to fix the duplicate key error
 * 
 * Usage: node backend/scripts/dropCourseCodeIndex.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const dropIndex = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uniflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    const db = mongoose.connection.db;
    const collection = db.collection('courses');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the old unique index on courseCode if it exists
    try {
      await collection.dropIndex('courseCode_1');
      console.log('✅ Successfully dropped old courseCode_1 index');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('ℹ️  courseCode_1 index does not exist (may have been already dropped)');
      } else {
        throw error;
      }
    }

    // The new compound index will be created automatically by Mongoose when the model is loaded
    console.log('✅ Migration complete! The new compound index will be created automatically.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropIndex();


