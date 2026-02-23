require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  const User = require('../models/User');

  // List all users
  const all = await User.collection.find({}).toArray();
  console.log(`👥 All users (${all.length}):`);
  all.forEach(u => console.log(`  ${u.role?.padEnd(8)} | ${u.email} | active:${u.isActive}`));

  // Fix or create parent
  const EMAIL    = 'parent@atharvpreschool.in';
  const PASSWORD = 'Parent@123';
  const hashed   = await bcrypt.hash(PASSWORD, 12);

  const existing = await User.collection.findOne({ email: EMAIL });
  if (existing) {
    await User.collection.updateOne(
      { email: EMAIL },
      { $set: { password: hashed, isActive: true, role: 'parent' } }
    );
    console.log(`\n✅ Parent password reset → ${EMAIL} / ${PASSWORD}`);
  } else {
    await User.collection.insertOne({
      name: 'Demo Parent', email: EMAIL, password: hashed,
      role: 'parent', phone: '+919876543211', isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
    });
    console.log(`\n✅ Parent created → ${EMAIL} / ${PASSWORD}`);
  }

  await mongoose.disconnect();
})();