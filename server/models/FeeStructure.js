const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee structure name is required'],
    trim: true,
  },
  class: {
    type: String,
    enum: ['Nursery', 'LKG', 'UKG', 'Daycare', 'All'],
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  feeHeads: [
    {
      name: {
        type: String,
        required: true,
        // e.g. "Tuition Fee", "Transport Fee", "Activity Fee", "Admission Fee"
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      isMonthly: {
        type: Boolean,
        default: true, // true = collected every month, false = one-time
      },
      isOptional: {
        type: Boolean,
        default: false,
      },
      description: String,
    },
  ],
  dueDay: {
    type: Number,
    default: 10, // Due on 10th of every month
    min: 1,
    max: 28,
  },
  lateFinePerDay: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: total monthly fee
feeStructureSchema.virtual('totalMonthly').get(function () {
  return this.feeHeads
    .filter(h => h.isMonthly)
    .reduce((sum, h) => sum + h.amount, 0);
});

// Virtual: total one-time fee
feeStructureSchema.virtual('totalOneTime').get(function () {
  return this.feeHeads
    .filter(h => !h.isMonthly)
    .reduce((sum, h) => sum + h.amount, 0);
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);