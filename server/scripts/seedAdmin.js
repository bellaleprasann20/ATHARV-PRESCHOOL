require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const EMAIL    = 'admin@atharvpreschool.in';
const PASSWORD = 'Admin@123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB connected');

    // Use the raw mongoose model to bypass any hook issues
    const User = require('../models/User');

    const exists = await User.findOne({ email: EMAIL });
    if (exists) {
      console.log(`⚠️  Admin already exists: ${EMAIL}`);
      console.log('   Run: node scripts/resetAdminPassword.js if login fails');
      await mongoose.disconnect();
      return;
    }

    // Hash password manually — bypasses pre-save hook entirely
    const hashed = await bcrypt.hash(PASSWORD, 12);

    await User.collection.insertOne({
      name:      'Admin',
      email:     EMAIL,
      password:  hashed,
      role:      'admin',
      phone:     '+919876543210',
      isActive:  true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n🎉 Admin user created!');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log('\n👉 Login at: http://localhost:5173/login\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();