const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Admin credentials - 5 admin accounts
const adminAccounts = [
  {
    name: 'Admin One',
    email: 'admin1@uniflow.edu',
    password: 'Admin1@2024',
    role: 'admin'
  },
  {
    name: 'Admin Two',
    email: 'admin2@uniflow.edu',
    password: 'Admin2@2024',
    role: 'admin'
  },
  {
    name: 'Admin Three',
    email: 'admin3@uniflow.edu',
    password: 'Admin3@2024',
    role: 'admin'
  },
  {
    name: 'Admin Four',
    email: 'admin4@uniflow.edu',
    password: 'Admin4@2024',
    role: 'admin'
  },
  {
    name: 'Admin Five',
    email: 'admin5@uniflow.edu',
    password: 'Admin5@2024',
    role: 'admin'
  }
];

const seedAdmins = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniflow');
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);

    // Clear existing admin accounts with these emails (optional - comment out if you want to keep existing admins)
    console.log('\n🔍 Checking for existing admin accounts...');
    for (const admin of adminAccounts) {
      const existingUser = await User.findOne({ email: admin.email });
      if (existingUser) {
        console.log(`⚠️  Admin with email ${admin.email} already exists. Updating...`);
        existingUser.name = admin.name;
        existingUser.password = admin.password; // Will be hashed by pre-save hook
        existingUser.role = 'admin';
        existingUser.isActive = true;
        await existingUser.save();
        console.log(`✓ Updated admin: ${admin.email}`);
      } else {
        // Create new admin
        const user = await User.create({
          name: admin.name,
          email: admin.email,
          password: admin.password, // Will be hashed by pre-save hook
          role: 'admin',
          isActive: true
        });
        console.log(`✓ Created admin: ${admin.email}`);
      }
    }

    console.log('\n✅ Successfully seeded 5 admin accounts!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('='.repeat(60));
    adminAccounts.forEach((admin, index) => {
      console.log(`\nAdmin ${index + 1}:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${admin.password}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Note: These admins can now login directly without registration.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admins:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Duplicate email found. Run the script again to update existing admins.');
    }
    process.exit(1);
  }
};

// Run the seed function
seedAdmins();

