const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorMiddleware = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const reportRoutes = require('./routes/reportRoutes');
const backupRoutes  = require('./routes/backupRoutes');
const parentRoutes  = require('./routes/parentRoutes');

const app = express();

// ─── SECURITY ───────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://atharvpreschool.in', 'https://www.atharvpreschool.in','https://atharv-preschool.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// ─── MIDDLEWARE ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// ─── STATIC FILES ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// ─── API ROUTES ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/parent', parentRoutes);

// ─── HEALTH CHECK ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Atharv Preschool API is running 🌟',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 HANDLER ────────────────────────────────────
app.use('*path', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────
app.use(errorMiddleware);

module.exports = app;