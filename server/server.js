require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startScheduler } = require('./jobs/scheduler');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Ensure required directories exist
['logs', 'uploads/photos', 'uploads/documents', 'backups', 'receipts'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║   🌟 ATHARV PRESCHOOL SERVER STARTED 🌟      ║
║   Port    : ${PORT}                              ║
║   Mode    : ${process.env.NODE_ENV || 'development'}                       ║
║   API URL : http://localhost:${PORT}/api         ║
╚══════════════════════════════════════════════╝
      `);
    });

    // Start cron jobs
    startScheduler();

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();