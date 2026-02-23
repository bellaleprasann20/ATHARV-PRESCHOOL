const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fatherName: { type: String, trim: true },
  motherName: { type: String, trim: true },
  primaryPhone: { type: String, required: true },
  secondaryPhone: { type: String },
  email: { type: String, lowercase: true, trim: true },
  occupation: { type: String },
  address: {
    street: String,
    city: { type: String, default: 'Pune' },
    state: { type: String, default: 'Maharashtra' },
    pincode: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  communicationPreference: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Parent', parentSchema);