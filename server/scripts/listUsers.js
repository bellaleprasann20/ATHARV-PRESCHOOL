require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await require('../models/User').find().select('-password');
    if (!users.length) {
      console.log('⚠️  No users found. Run: node scripts/seedAdmin.js');
    } else {
      console.log(`\n👥 ${users.length} user(s) in DB:\n`);
      users.forEach(u =>
        console.log(`  ${u.role.toUpperCase().padEnd(8)} | ${u.email.padEnd(35)} | active:${u.isActive} | ${u.name}`)
      );
      console.log('');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();