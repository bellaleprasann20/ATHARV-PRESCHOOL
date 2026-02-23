/**
 * jobs/scheduler.js
 * Starts all cron jobs when the server boots.
 * Import and call startScheduler() in server.js.
 */

const cron               = require('node-cron');
const { runAutoBackup }  = require('./autoBackup');
const { runDueFeeAlerts} = require('./dueFeeAlert');
const logger             = require('../utils/logger');

const startScheduler = () => {
  // ── Daily backup — 2:00 AM IST ────────────────────────────
  const backupCron = process.env.AUTO_BACKUP_TIME || '0 2 * * *';
  cron.schedule(backupCron, async () => {
    logger.info('🕑 Cron: starting auto backup...');
    try {
      await runAutoBackup();
    } catch (err) {
      logger.error(`Cron backup error: ${err.message}`);
    }
  }, { scheduled: true, timezone: 'Asia/Kolkata' });

  // ── Due fee alerts — 12th of every month, 9:00 AM IST ────
  cron.schedule('0 9 12 * *', async () => {
    logger.info('📢 Cron: starting due fee alerts...');
    try {
      const result = await runDueFeeAlerts({ emailAlerts: true, smsAlerts: true });
      logger.info(`Cron alerts done: emailed=${result.emailed} sms=${result.smsed}`);
    } catch (err) {
      logger.error(`Cron alert error: ${err.message}`);
    }
  }, { scheduled: true, timezone: 'Asia/Kolkata' });

  logger.info(`✅ Scheduler started | Backup: ${backupCron} | Alerts: 0 9 12 * * (IST)`);
};

module.exports = { startScheduler };