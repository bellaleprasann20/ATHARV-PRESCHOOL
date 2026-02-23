const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeAssignment',
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
  },

  // Payment Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Amount must be at least 1'],
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'online', 'cheque', 'bank_transfer', 'upi'],
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed',
  },

  // For which months/period
  forMonths: [
    {
      month: Number,
      year: Number,
      amount: Number,
    },
  ],
  academicYear: { type: String },

  // Fee breakdown paid
  feeBreakdown: [
    {
      headName: String,
      amount: Number,
    },
  ],

  lateFine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalBeforeDiscount: Number,
  remarks: String,

  // Cash payment - collected by
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Online payment (Razorpay)
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  // Cheque details
  chequeNo: String,
  chequeDate: Date,
  bankName: String,
  chequeStatus: {
    type: String,
    enum: ['pending', 'cleared', 'bounced'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);