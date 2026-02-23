/**
 * jobs/autoBackup.js
 *
 * Standalone backup job — wraps backupController.runAutoBackup() with:
 *   - Admin email notification (success / failure)
 *   - Disk pruning (keeps last MAX_BACKUPS auto backups)
 *   - Graceful DB connection check
 *
 * Called by:
 *   scheduler.js  (cron — daily 2 AM IST)
 *   backupController.js can also call runAutoBackup() directly
 *
 * Env vars:
 *   AUTO_BACKUP_ENABLED=true   (default true, set false to disable)
 *   MAX_BACKUPS=30             (default 30)
 *   ADMIN_EMAIL=xyz@mail.com   (notification recipient)
 */

const path       = require('path');
const fs         = require('fs');
const mongoose   = require('mongoose');
const nodemailer = require('nodemailer');
const Backup     = require('../models/Backup');
const logger     = require('../utils/logger');

const BACKUP_DIR  = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, '../backups'));
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || '30', 10);
const ENABLED     = process.env.AUTO_BACKUP_ENABLED !== 'false';

// ── Email helper ──────────────────────────────────────────────
const sendNotification = async (success, details) => {
  if (!process.env.EMAIL_USER) return; // email not configured
  try {
    const transport = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
      port:   Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_PORT === '465',
      auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const icon    = success ? '✅' : '❌';
    const colour  = success ? '#16a34a' : '#dc2626';
    const subject = `${icon} Auto Backup ${success ? 'Succeeded' : 'Failed'} — Atharv Preschool`;

    const rows = Object.entries(details)
      .map(([k, v]) => `<tr><td style="color:#6b7280;padding:5px 0;font-size:13px">${k}</td>
                        <td style="font-weight:700;padding:5px 8px;font-size:13px">${v}</td></tr>`)
      .join('');

    await transport.sendMail({
      from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to:      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
               <h2 style="color:${colour};margin:0 0 16px">${subject}</h2>
               <table>${rows}</table>
               <p style="color:#9ca3af;font-size:11px;margin-top:20px">
                 Atharv Preschool — Automated Backup Service
               </p>
             </div>`,
    });
    logger.info('📧 Backup notification email sent.');
  } catch (err) {
    logger.warn(`⚠️  Backup email notification failed: ${err.message}`);
  }
};

// ── Prune old backups beyond MAX_BACKUPS ─────────────────────
const pruneOldBackups = async () => {
  // Prune disk files
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(MAX_BACKUPS);

    for (const f of files) {
      try {
        fs.unlinkSync(path.join(BACKUP_DIR, f.name));
        logger.info(`🗑️  Pruned old backup file: ${f.name}`);
      } catch (e) {
        logger.warn(`⚠️  Could not prune ${f.name}: ${e.message}`);
      }
    }
  }

  // Prune DB records (keep only latest MAX_BACKUPS of type 'auto')
  const old = await Backup.find({ type: 'auto' })
    .sort({ createdAt: -1 })
    .skip(MAX_BACKUPS);

  for (const rec of old) {
    await Backup.findByIdAndDelete(rec._id);
  }
};

// ── MAIN ──────────────────────────────────────────────────────
/**
 * Run an automated backup.
 * Delegates the actual data export to backupController.runAutoBackup(),
 * then handles notifications + pruning.
 *
 * @returns {Promise<object|null>}  Backup DB record, or null if disabled/skipped
 */
const runAutoBackup = async () => {
  if (!ENABLED) {
    logger.info('⏭️  Auto backup is disabled (AUTO_BACKUP_ENABLED=false)');
    return null;
  }

  // Check DB is connected
  if (mongoose.connection.readyState !== 1) {
    logger.warn('⚠️  Auto backup skipped — database not connected');
    return null;
  }

  logger.info('🔄 Auto backup starting...');
  const t0 = Date.now();

  try {
    // Delegate to the existing backupController logic (reuse, don't duplicate)
    const { runAutoBackup: controllerBackup } = require('../controllers/backupController');
    await controllerBackup();

    // Fetch the record just created so we can return / notify with details
    const record = await Backup.findOne({ type: 'auto', status: 'success' })
      .sort({ createdAt: -1 });

    const duration = ((Date.now() - t0) / 1000).toFixed(1);

    await pruneOldBackups();

    await sendNotification(true, {
      'Trigger':    'Scheduled (auto)',
      'File':       record?.filename  || 'n/a',
      'Size':       record?.fileSize  ? `${(record.fileSize / 1024).toFixed(1)} KB` : 'n/a',
      'Duration':   `${duration}s`,
      'Timestamp':  new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    logger.info(`✅ Auto backup complete in ${duration}s`);
    return record;

  } catch (err) {
    logger.error(`❌ Auto backup failed: ${err.message}`);

    await sendNotification(false, {
      'Trigger':   'Scheduled (auto)',
      'Error':     err.message,
      'Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    throw err; // let scheduler.js catch and log
  }
};

module.exports = { runAutoBackup };