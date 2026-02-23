const mongoose = require('mongoose');

const feeAssignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  // Overrides - if a student has a custom discount/waiver
  discount: {
    type: Number,
    default: 0, // percentage
  },
  discountReason: String,
  // Which months have been paid (for monthly tracking)
  monthlyStatus: [
    {
      month: { type: Number, min: 1, max: 12 }, // 1=Jan, 6=June
      year: { type: Number },
      status: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'waived'],
        default: 'pending',
      },
      dueAmount: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      dueDate: Date,
      paidDate: Date,
      lateFine: { type: Number, default: 0 },
      payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: total dues
feeAssignmentSchema.virtual('totalDue').get(function () {
  return this.monthlyStatus
    .filter(m => m.status === 'pending' || m.status === 'partial')
    .reduce((sum, m) => sum + (m.dueAmount - m.paidAmount + m.lateFine), 0);
});

module.exports = mongoose.model('FeeAssignment', feeAssignmentSchema);