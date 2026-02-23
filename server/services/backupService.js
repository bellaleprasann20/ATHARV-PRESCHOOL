/**
 * services/backupService.js
 *
 * Pure service layer for database backups and restores.
 * Controllers and cron jobs call these functions — no Express req/res here.
 *
 * Exports:
 *   createBackup(trigger?)        → { filename, filePath, sizeMB, totalRecords, duration, record }
 *   restoreBackup(filePath, collections?) → { restoredAt, summary }
 *   listBackupFiles()             → [{ name, sizeMB, mtime }]
 *   pruneBackups(max?)            → number of files deleted
 */

const path     = require('path');
const fs       = require('fs');
const mongoose = require('mongoose');
const Backup   = require('../models/Backup');
const logger   = require('../utils/logger');

const BACKUP_DIR  = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, '../backups'));
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || '30', 10);

// All collections to export — add new models here as the schema grows
const COLLECTIONS = [
  { name: 'Student',       get: () => require('../models/Student')       },
  { name: 'Parent',        get: () => require('../models/Parent')        },
  { name: 'User',          get: () => require('../models/User')          },
  { name: 'FeeStructure',  get: () => require('../models/FeeStructure')  },
  { name: 'FeeAssignment', get: () => require('../models/FeeAssignment') },
  { name: 'Payment',       get: () => require('../models/Payment')       },
  { name: 'Receipt',       get: () => require('../models/Receipt')       },
];

// ── Ensure directory ──────────────────────────────────────────
const ensureDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    logger.info(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
};

// ── Build timestamped filename ────────────────────────────────
const buildFilename = (trigger = 'manual') => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `backup_${trigger}_${ts}.json`;
};

// ─────────────────────────────────────────────────────────────
// createBackup
// ─────────────────────────────────────────────────────────────
/**
 * Export all MongoDB collections to a JSON file on disk.
 *
 * @param {string}  trigger   'manual' | 'auto' | 'pre-restore'
 * @param {object}  [meta]    extra metadata to embed in backup file
 * @param {object}  [createdBy] User _id (for audit trail in DB)
 * @returns {Promise<object>} backup summary
 */
const createBackup = async (trigger = 'manual', meta = {}, createdBy = null) => {
  ensureDir();

  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected — cannot create backup');
  }

  const t0       = Date.now();
  const filename = buildFilename(trigger);
  const filePath = path.join(BACKUP_DIR, filename);

  logger.info(`🔄 Creating ${trigger} backup → ${filename}`);

  // Collect all data in parallel
  const collections = {};
  const counts      = {};

  await Promise.all(
    COLLECTIONS.map(async ({ name, get }) => {
      try {
        const docs       = await get().find({}).lean();
        collections[name] = docs;
        counts[name]      = docs.length;
        logger.info(`  📦 ${name}: ${docs.length} records`);
      } catch (err) {
        logger.warn(`  ⚠️  Failed to export ${name}: ${err.message}`);
        collections[name] = [];
        counts[name]      = 0;
      }
    })
  );

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  const payload = {
    meta: {
      exportedAt:   new Date().toISOString(),
      version:      '2.0',
      trigger,
      dbName:       mongoose.connection.name,
      school:       process.env.SCHOOL_NAME || 'Atharv Preschool',
      totalRecords,
      counts,
      ...meta,
    },
    collections,
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

  const stat    = fs.statSync(filePath);
  const sizeMB  = parseFloat((stat.size / 1024 / 1024).toFixed(3));
  const sizeKB  = parseFloat((stat.size / 1024).toFixed(1));
  const duration = parseFloat(((Date.now() - t0) / 1000).toFixed(2));

  // Persist to DB
  const record = await Backup.create({
    filename,
    filePath,
    fileSize:     stat.size,
    type:         trigger === 'auto' ? 'auto' : 'manual',
    status:       'success',
    collections:  Object.keys(counts),
    recordCounts: counts,
    createdBy,
  });

  logger.info(`✅ Backup done in ${duration}s | ${totalRecords} records | ${sizeMB} MB`);

  return { filename, filePath, sizeMB, sizeKB, totalRecords, counts, duration, record };
};

// ─────────────────────────────────────────────────────────────
// restoreBackup
// ─────────────────────────────────────────────────────────────
/**
 * ⚠️  DESTRUCTIVE — clears and re-inserts data.
 * Creates a pre-restore backup automatically before proceeding.
 *
 * @param {string}   filePath       Absolute path to backup JSON file
 * @param {string[]} [collections]  Subset to restore; restores all if omitted
 * @returns {Promise<object>}       { restoredAt, preRestoreBackup, summary }
 */
const restoreBackup = async (filePath, collections = null) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file not found: ${filePath}`);
  }

  logger.warn(`⚠️  RESTORE starting from: ${path.basename(filePath)}`);

  // Safety net: create a backup of current state before wiping anything
  let preRestoreBackup = null;
  try {
    preRestoreBackup = await createBackup('pre-restore');
    logger.info(`🛡️  Pre-restore snapshot: ${preRestoreBackup.filename}`);
  } catch (err) {
    logger.warn(`⚠️  Pre-restore backup failed: ${err.message}. Proceeding anyway.`);
  }

  const raw  = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Support both v1 (data.collections) and v2 (collections) formats
  const data = raw.collections || raw.data || {};

  const toRestore = collections || COLLECTIONS.map(c => c.name);
  const summary   = {};

  for (const name of toRestore) {
    const cDef = COLLECTIONS.find(c => c.name === name);
    if (!cDef) {
      summary[name] = { status: 'skipped', reason: 'Unknown collection' };
      continue;
    }

    // Try to find data under exact name or lowercase key (v1 compat)
    const docs = data[name] || data[name.toLowerCase() + 's'] || data[name.toLowerCase()] || [];
    const Model = cDef.get();

    try {
      await Model.deleteMany({});
      if (docs.length > 0) {
        await Model.insertMany(docs, { ordered: false });
      }
      summary[name] = { status: 'ok', restored: docs.length };
      logger.info(`  ✅ Restored ${name}: ${docs.length} records`);
    } catch (err) {
      summary[name] = { status: 'error', error: err.message };
      logger.error(`  ❌ Failed to restore ${name}: ${err.message}`);
    }
  }

  const restoredAt = new Date();
  logger.info(`✅ Restore complete from ${path.basename(filePath)}`);

  return {
    restoredAt,
    sourceFile:       path.basename(filePath),
    preRestoreBackup: preRestoreBackup?.filename || null,
    summary,
  };
};

// ─────────────────────────────────────────────────────────────
// listBackupFiles
// ─────────────────────────────────────────────────────────────
/**
 * List all JSON backup files on disk, newest first.
 *
 * @returns {{ name, filePath, sizeMB, mtime }[]}
 */
const listBackupFiles = () => {
  ensureDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const fp   = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(fp);
      return {
        name:    f,
        filePath: fp,
        sizeMB:  parseFloat((stat.size / 1024 / 1024).toFixed(3)),
        sizeKB:  parseFloat((stat.size / 1024).toFixed(1)),
        mtime:   stat.mtime,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
};

// ─────────────────────────────────────────────────────────────
// pruneBackups
// ─────────────────────────────────────────────────────────────
/**
 * Delete oldest backup files beyond the configured maximum.
 *
 * @param {number} max  Max backups to keep (defaults to env MAX_BACKUPS)
 * @returns {number}    Number of files deleted
 */
const pruneBackups = async (max = MAX_BACKUPS) => {
  ensureDir();
  const files   = listBackupFiles();
  const toDelete = files.slice(max);
  let deleted    = 0;

  for (const f of toDelete) {
    try {
      fs.unlinkSync(f.filePath);
      logger.info(`🗑️  Pruned: ${f.name}`);
      deleted++;
    } catch (err) {
      logger.warn(`⚠️  Could not prune ${f.name}: ${err.message}`);
    }
  }

  // Also prune excess DB records
  const oldRecords = await Backup.find()
    .sort({ createdAt: -1 })
    .skip(max);
  for (const r of oldRecords) await Backup.findByIdAndDelete(r._id);

  return deleted;
};

module.exports = {
  createBackup,
  restoreBackup,
  listBackupFiles,
  pruneBackups,
  BACKUP_DIR,
};