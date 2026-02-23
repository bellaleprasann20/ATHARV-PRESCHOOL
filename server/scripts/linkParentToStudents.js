/**
 * Links the demo parent account to all students (for testing).
 * Run: node scripts/linkParentToStudents.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  const User    = require('../models/User');
  const Parent  = require('../models/Parent');
  const Student = require('../models/Student');

  const parentUser = await User.findOne({ email: 'parent@atharvpreschool.in' });
  if (!parentUser) {
    console.log('❌ No parent user found. Run: node scripts/seedParent.js first');
    await mongoose.disconnect(); return;
  }

  const students = await Student.find({ status: 'active' });
  if (!students.length) {
    console.log('❌ No active students found. Add students via the admin panel first.');
    await mongoose.disconnect(); return;
  }

  const studentIds = students.map(s => s._id);

  // Update or create parent profile with children
  const parent = await Parent.findOneAndUpdate(
    { user: parentUser._id },
    { $set: { children: studentIds } },
    { new: true, upsert: true }
  );

  console.log(`✅ Linked ${students.length} student(s) to demo parent:`);
  students.forEach(s => console.log(`   • ${s.firstName} ${s.lastName} (${s.class})`));
  console.log('\nNow login as parent and refresh the dashboard!\n');

  await mongoose.disconnect();
})();