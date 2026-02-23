require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const EMAIL        = 'admin@atharvpreschool.in';
const NEW_PASSWORD = 'Admin@123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash(NEW_PASSWORD, 12);
    const result = await require('../models/User').findOneAndUpdate(
      { email: EMAIL },
      { password: hashed, isActive: true },
      { new: true }
    );
    if (!result) {
      console.log(`❌ No user with email: ${EMAIL}`);
      console.log('   Run: node scripts/seedAdmin.js');
    } else {
      console.log(`✅ Password reset for ${EMAIL}`);
      console.log(`   New password: ${NEW_PASSWORD}`);
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();