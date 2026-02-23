const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number }, // in bytes
  type: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'manual',
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
  collections: [String], // which collections were backed up
  recordCounts: {
    students: Number,
    payments: Number,
    receipts: Number,
    users: Number,
  },
  errorMessage: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Backup', backupSchema);