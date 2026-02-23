const express = require('express');
const router = express.Router();
const {
  collectPayment, createRazorpayOrder, verifyOnlinePayment, getPayments, getPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, adminOrTeacher } = require('../middleware/roleMiddleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/collect', adminOnly, collectPayment);
router.post('/create-order', paymentLimiter, createRazorpayOrder);
router.post('/verify-online', paymentLimiter, verifyOnlinePayment);
router.get('/', adminOrTeacher, getPayments);
router.get('/:id', adminOrTeacher, getPayment);

module.exports = router;