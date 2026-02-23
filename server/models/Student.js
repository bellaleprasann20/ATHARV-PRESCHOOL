const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Basic Info
  admissionNo: {
    type: String,
    unique: true,
    required: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: '',
  },

  // Academic Info
  class: {
    type: String,
    enum: ['Nursery', 'LKG', 'UKG', 'Daycare'],
    required: [true, 'Class is required'],
  },
  section: {
    type: String,
    default: 'A',
  },
  academicYear: {
    type: String,
    required: true,
    default: () => {
      const now = new Date();
      const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
      return `${year}-${year + 1}`;
    },
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred', 'passed_out'],
    default: 'active',
  },

  // Parent/Guardian Info
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
  },
  fatherName: { type: String, trim: true },
  motherName: { type: String, trim: true },
  guardianPhone: {
    type: String,
    required: [true, 'Guardian phone is required'],
  },
  guardianEmail: { type: String, trim: true, lowercase: true },
  address: {
    street: String,
    city: { type: String, default: 'Pune' },
    state: { type: String, default: 'Maharashtra' },
    pincode: String,
  },

  // Medical Info
  allergies: [String],
  medicalNotes: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },

  // Documents
  documents: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: age
studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// Auto-generate admission number
studentSchema.pre('save', async function (next) {
  if (!this.admissionNo) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.model('Student').countDocuments();
    this.admissionNo = `ATH${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);