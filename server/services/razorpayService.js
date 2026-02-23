/**
 * services/razorpayService.js
 *
 * Wraps Razorpay SDK with school-specific helpers:
 *   createOrder()       — create a payment order
 *   verifySignature()   — HMAC verification (throws on invalid)
 *   fetchPayment()      — get payment details from Razorpay
 *   initiateRefund()    — issue full or partial refund
 *   buildCheckoutOpts() — options object for Razorpay checkout.js
 *
 * All monetary amounts are in ₹ (rupees) in this service.
 * Conversion to paise happens internally.
 */

const crypto   = require('crypto');
const razorpay = require('../config/razorpay');
const logger   = require('../utils/logger');

// ── createOrder ───────────────────────────────────────────────
/**
 * Create a Razorpay order for fee collection.
 *
 * @param {object} opts
 * @param {number}   opts.amount       Amount in ₹ (rupees)
 * @param {string}   opts.studentId
 * @param {string}   opts.studentName
 * @param {string}   opts.admissionNo
 * @param {string}   [opts.parentId]
 * @param {Array}    [opts.months]     [{month, year}]
 * @param {string}   [opts.currency]   default 'INR'
 * @returns {Promise<object>}          Razorpay order object + convenience fields
 */
const createOrder = async ({
  amount, studentId, studentName, admissionNo, parentId, months = [], currency = 'INR',
}) => {
  if (!amount || amount < 1) throw new Error('Amount must be at least ₹1');

  const order = await razorpay.orders.create({
    amount:   Math.round(Number(amount) * 100),   // paise
    currency,
    receipt:  `rcpt_${admissionNo}_${Date.now()}`,
    notes: {
      studentId,
      studentName,
      admissionNo,
      parentId:   String(parentId || ''),
      months:     JSON.stringify(months),
      schoolName: process.env.SCHOOL_NAME || 'Atharv Preschool',
    },
  });

  logger.info(`💳 Razorpay order created: ${order.id} | ${admissionNo} | ₹${amount}`);

  return {
    ...order,
    amountRs:   amount,
    keyId:      process.env.RAZORPAY_KEY_ID,
    studentId,
    studentName,
    months,
  };
};

// ── verifySignature ───────────────────────────────────────────
/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 * Throws an Error with a descriptive message on failure.
 *
 * @param {string} orderId     razorpay_order_id from webhook / frontend
 * @param {string} paymentId   razorpay_payment_id
 * @param {string} signature   razorpay_signature
 */
const verifySignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) {
    throw new Error('Missing Razorpay signature fields (orderId, paymentId, signature)');
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expected !== signature) {
    logger.warn(`⚠️  Invalid Razorpay signature — order: ${orderId} payment: ${paymentId}`);
    throw new Error('Payment verification failed: invalid signature. Possible tampering detected.');
  }

  logger.info(`✅ Razorpay signature verified: ${paymentId}`);
};

// ── fetchPayment ──────────────────────────────────────────────
/**
 * Fetch payment details from Razorpay API.
 * Useful for server-side verification and refund eligibility.
 *
 * @param {string} paymentId  razorpay_payment_id
 * @returns {Promise<object>} Razorpay payment object
 */
const fetchPayment = async (paymentId) => {
  const payment = await razorpay.payments.fetch(paymentId);
  return {
    ...payment,
    amountRs: payment.amount / 100,   // convert paise → ₹
  };
};

// ── initiateRefund ────────────────────────────────────────────
/**
 * Issue a full or partial refund for a completed payment.
 *
 * @param {string} paymentId      razorpay_payment_id to refund
 * @param {number} [amountRs]     Refund amount in ₹. Omit for full refund.
 * @param {string} [notes]        Reason string stored on Razorpay
 * @returns {Promise<object>}     Razorpay refund object
 */
const initiateRefund = async (paymentId, amountRs, notes = '') => {
  const opts = { speed: 'normal', notes: { reason: notes } };
  if (amountRs) opts.amount = Math.round(Number(amountRs) * 100); // partial refund in paise

  const refund = await razorpay.payments.refund(paymentId, opts);

  logger.info(`💸 Refund initiated: ${refund.id} | payment: ${paymentId} | ₹${(refund.amount / 100).toFixed(2)}`);

  return {
    ...refund,
    amountRs: refund.amount / 100,
  };
};

// ── buildCheckoutOpts ─────────────────────────────────────────
/**
 * Build the options object for Razorpay Checkout.js (frontend).
 * Return this from your order-creation endpoint so the frontend
 * can open the payment modal with one call.
 *
 * @param {object} order   Result from createOrder()
 * @param {object} prefill { name, email, contact }
 * @returns {object}       Pass directly to new Razorpay(opts).open()
 */
const buildCheckoutOpts = (order, prefill = {}) => ({
  key:         process.env.RAZORPAY_KEY_ID,
  amount:      order.amount,                    // paise
  currency:    order.currency || 'INR',
  name:        process.env.SCHOOL_NAME || 'Atharv Preschool',
  description: `Fee payment — ${order.notes?.studentName || ''}`,
  order_id:    order.id,
  prefill: {
    name:    prefill.name    || '',
    email:   prefill.email   || '',
    contact: prefill.contact || '',
  },
  theme: { color: '#4F46E5' },
  notes: order.notes || {},
});

module.exports = {
  createOrder,
  verifySignature,
  fetchPayment,
  initiateRefund,
  buildCheckoutOpts,
};