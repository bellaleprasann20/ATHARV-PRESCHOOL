const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    unique: true,
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },

  // Snapshot at time of receipt (for historical accuracy)
  studentSnapshot: {
    name: String,
    admissionNo: String,
    class: String,
    section: String,
    fatherName: String,
    guardianPhone: String,
  },

  // Receipt details
  amount: { type: Number, required: true },
  paymentMode: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  academicYear: { type: String },
  forMonths: [{ month: Number, year: Number }],

  feeBreakdown: [
    {
      headName: String,
      amount: Number,
    },
  ],
  lateFine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  remarks: String,

  // PDF file path
  pdfPath: { type: String },
  pdfUrl: { type: String },

  // Who generated it
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  issuedAt: { type: Date, default: Date.now },

  // Email/SMS status
  emailSent: { type: Boolean, default: false },
  smsSent: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Receipt', receiptSchema);