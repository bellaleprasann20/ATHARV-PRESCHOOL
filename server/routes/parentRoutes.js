/**
 * routes/parentRoutes.js
 * Base: /api/parent
 * All routes: JWT required + role must be 'parent'
 */

const express = require('express');
const router  = express.Router();

const {
  getParentProfile,
  updateParentProfile,
  getChildrenFeeStatus,
  getChildrenReceipts,
  createPaymentOrder,
  verifyPayment,
} = require('../controllers/parentController');

const { protect }     = require('../middleware/authMiddleware');
const { parentOnly }  = require('../middleware/roleMiddleware');

// All routes below require a valid JWT + parent role
router.use(protect);
router.use(parentOnly);

// ── Profile ─────────────────────────────────────────
// GET  /api/parent/profile
// PUT  /api/parent/profile
router.route('/profile')
  .get(getParentProfile)
  .put(updateParentProfile);

// ── Fee status ───────────────────────────────────────
// GET  /api/parent/fees?academicYear=2024-2025
router.get('/fees', getChildrenFeeStatus);

// ── Receipts ─────────────────────────────────────────
// GET  /api/parent/receipts?studentId=&page=1&limit=10
router.get('/receipts', getChildrenReceipts);

// ── Online payments ───────────────────────────────────
// POST /api/parent/pay/create-order
// POST /api/parent/pay/verify
router.post('/pay/create-order', createPaymentOrder);
router.post('/pay/verify',       verifyPayment);

module.exports = router;