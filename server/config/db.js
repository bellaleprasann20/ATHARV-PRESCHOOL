const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Mongoose 6+ and 9.x do not support useNewUrlParser or useUnifiedTopology
    // They are enabled by default. Passing them will cause the app to crash.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Listen for errors after the initial connection
    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    // Handle unexpected disconnections
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected. Check your network or MongoDB Atlas status.');
    });

    // Graceful shutdown on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit the process because the app cannot function without the DB
    process.exit(1);
  }
};

module.exports = connectDB;