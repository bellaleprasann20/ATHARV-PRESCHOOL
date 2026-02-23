const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Backup = require('../models/Backup');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const FeeAssignment = require('../models/FeeAssignment');
const { sendSuccess, sendError } = require('../utils/sendResponse');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Create manual backup
const createBackup = async (req, res, next) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Collect all data
    const [students, payments, receipts, users, feeAssignments] = await Promise.all([
      Student.find().lean(),
      Payment.find().lean(),
      Receipt.find().lean(),
      User.find().select('-password').lean(),
      FeeAssignment.find().lean(),
    ]);

    const backupData = {
      metadata: {
        createdAt: new Date(),
        version: '1.0',
        school: process.env.SCHOOL_NAME,
        dbName: mongoose.connection.name,
        collections: ['students', 'payments', 'receipts', 'users', 'feeAssignments'],
      },
      data: { students, payments, receipts, users, feeAssignments },
    };

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    const stats = fs.statSync(filepath);

    const backup = await Backup.create({
      filename,
      filePath: filepath,
      fileSize: stats.size,
      type: req.body?.type || 'manual',
      status: 'success',
      collections: Object.keys(backupData.data),
      recordCounts: {
        students: students.length,
        payments: payments.length,
        receipts: receipts.length,
        users: users.length,
      },
      createdBy: req.user?._id,
    });

    sendSuccess(res, 'Backup created successfully.', {
      backup,
      filename,
      size: `${(stats.size / 1024).toFixed(2)} KB`,
    }, null, 201);
  } catch (error) { next(error); }
};

// Get all backup logs
const getBackups = async (req, res, next) => {
  try {
    const backups = await Backup.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    sendSuccess(res, 'Backups fetched.', backups);
  } catch (error) { next(error); }
};

// Download backup file
const downloadBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return sendError(res, 'Backup not found.', 404);
    if (!fs.existsSync(backup.filePath)) return sendError(res, 'Backup file missing on disk.', 404);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
    fs.createReadStream(backup.filePath).pipe(res);
  } catch (error) { next(error); }
};

// Delete old backup
const deleteBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return sendError(res, 'Backup not found.', 404);

    if (fs.existsSync(backup.filePath)) fs.unlinkSync(backup.filePath);
    await backup.deleteOne();

    sendSuccess(res, 'Backup deleted.');
  } catch (error) { next(error); }
};

// Restore from backup (DANGEROUS - admin only)
const restoreBackup = async (req, res, next) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return sendError(res, 'Backup not found.', 404);
    if (!fs.existsSync(backup.filePath)) return sendError(res, 'Backup file not found on disk.', 404);

    const raw = fs.readFileSync(backup.filePath, 'utf-8');
    const { data } = JSON.parse(raw);

    // Clear and restore (careful - this overwrites!)
    if (data.students?.length) {
      await Student.deleteMany({});
      await Student.insertMany(data.students);
    }
    if (data.payments?.length) {
      await Payment.deleteMany({});
      await Payment.insertMany(data.payments);
    }

    sendSuccess(res, `Restore complete. Restored: ${backup.filename}`);
  } catch (error) { next(error); }
};

// Internal function for cron auto-backup
const runAutoBackup = async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `auto_backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);

    const [students, payments, receipts, users, feeAssignments] = await Promise.all([
      Student.find().lean(), Payment.find().lean(),
      Receipt.find().lean(), User.find().select('-password').lean(),
      FeeAssignment.find().lean(),
    ]);

    const backupData = {
      metadata: { createdAt: new Date(), type: 'auto' },
      data: { students, payments, receipts, users, feeAssignments },
    };

    fs.writeFileSync(filepath, JSON.stringify(backupData));
    const stats = fs.statSync(filepath);

    await Backup.create({
      filename, filePath: filepath, fileSize: stats.size,
      type: 'auto', status: 'success',
      collections: ['students', 'payments', 'receipts', 'users', 'feeAssignments'],
      recordCounts: { students: students.length, payments: payments.length, receipts: receipts.length, users: users.length },
    });

    // Keep only last 30 auto backups
    const autoBackups = await Backup.find({ type: 'auto' }).sort({ createdAt: -1 }).skip(30);
    for (const old of autoBackups) {
      if (fs.existsSync(old.filePath)) fs.unlinkSync(old.filePath);
      await old.deleteOne();
    }

    console.log(`✅ Auto backup completed: ${filename}`);
  } catch (error) {
    console.error('❌ Auto backup failed:', error.message);
    await Backup.create({ filename: 'failed', filePath: '', type: 'auto', status: 'failed', errorMessage: error.message });
  }
};

module.exports = { createBackup, getBackups, downloadBackup, deleteBackup, restoreBackup, runAutoBackup };