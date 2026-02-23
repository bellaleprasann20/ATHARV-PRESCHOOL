const express = require('express');
const router = express.Router();
const {
  getMonthlyReport, getClassWiseReport, getDefaulters, exportToExcel, getDashboardStats,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, adminOrTeacher } = require('../middleware/roleMiddleware');

router.use(protect, adminOrTeacher);

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyReport);
router.get('/class-wise', getClassWiseReport);
router.get('/defaulters', getDefaulters);
router.get('/export', adminOnly, exportToExcel);

module.exports = router;