require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const EMAIL    = 'parent@atharvpreschool.in';
const PASSWORD = 'Parent@123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB connected');

    const User   = require('../models/User');
    const Parent = require('../models/Parent');

    // Check if already exists
    const exists = await User.findOne({ email: EMAIL });
    if (exists) {
      console.log(`⚠️  Parent user already exists: ${EMAIL}`);
      console.log('   If login fails run: node scripts/resetParentPassword.js');
      await mongoose.disconnect();
      return;
    }

    // Create User with role=parent
    const hashed = await bcrypt.hash(PASSWORD, 12);
    const user = await User.collection.insertOne({
      name:      'Demo Parent',
      email:     EMAIL,
      password:  hashed,
      role:      'parent',
      phone:     '+919876543211',
      isActive:  true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Parent profile linked to User
    await Parent.create({
      user:         user.insertedId,
      fatherName:   'Demo Father',
      motherName:   'Demo Mother',
      primaryPhone: '9876543211',
      email:        EMAIL,
    });

    console.log('\n🎉 Parent user created!');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log('\n👉 Login at: http://localhost:5173/login\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();