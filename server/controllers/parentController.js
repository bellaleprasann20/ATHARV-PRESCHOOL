/**
 * controllers/parentController.js
 *
 * All parent-portal API logic:
 *   GET  /api/parent/profile          — own profile + linked children
 *   PUT  /api/parent/profile          — update profile
 *   GET  /api/parent/fees             — fee status for all children
 *   GET  /api/parent/receipts         — receipts for all children
 *   POST /api/parent/pay/create-order — create Razorpay order
 *   POST /api/parent/pay/verify       — verify signature + record payment + emit receipt
 */

const crypto        = require('crypto');
const Parent        = require('../models/Parent');
const Student       = require('../models/Student');
const FeeAssignment = require('../models/FeeAssignment');
const Payment       = require('../models/Payment');
const Receipt       = require('../models/Receipt');
const razorpay      = require('../config/razorpay');
const { generateReceiptNo } = require('../utils/generateReceiptNo');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const logger        = require('../utils/logger');

// ── helper ────────────────────────────────────────────────────
const currentAcademicYear = () => {
  const now  = new Date();
  const yr   = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${yr}-${yr + 1}`;
};

// ─────────────────────────────────────────────────────────────
// GET /api/parent/profile
// ─────────────────────────────────────────────────────────────
const getParentProfile = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .populate('children', 'firstName lastName admissionNo class section status photo gender');

    if (!parent) return sendError(res, 'Parent profile not found. Contact the school office.', 404);

    sendSuccess(res, 'Profile fetched.', parent);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/parent/profile
// ─────────────────────────────────────────────────────────────
const updateParentProfile = async (req, res, next) => {
  try {
    const {
      fatherName, motherName, primaryPhone, secondaryPhone,
      occupation, address, communicationPreference,
    } = req.body;

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return sendError(res, 'Parent profile not found.', 404);

    if (fatherName    !== undefined) parent.fatherName    = fatherName;
    if (motherName    !== undefined) parent.motherName    = motherName;
    if (primaryPhone  !== undefined) parent.primaryPhone  = primaryPhone;
    if (secondaryPhone!== undefined) parent.secondaryPhone= secondaryPhone;
    if (occupation    !== undefined) parent.occupation    = occupation;
    if (address       !== undefined) parent.address       = { ...parent.address.toObject?.() ?? parent.address, ...address };
    if (communicationPreference !== undefined) {
      parent.communicationPreference = {
        ...(parent.communicationPreference.toObject?.() ?? parent.communicationPreference),
        ...communicationPreference,
      };
    }

    await parent.save();
    sendSuccess(res, 'Profile updated successfully.', parent);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// GET /api/parent/fees
// query: academicYear (optional, defaults to current)
// ─────────────────────────────────────────────────────────────
const getChildrenFeeStatus = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return sendError(res, 'Parent profile not found.', 404);
    if (!parent.children.length) {
      return sendSuccess(res, 'No children linked to this account.', { children: [], grandTotalDue: 0 });
    }

    const academicYear = req.query.academicYear || currentAcademicYear();

    const children = await Promise.all(
      parent.children.map(async (childId) => {
        const student = await Student.findById(childId)
          .select('firstName lastName admissionNo class section status photo');
        if (!student) return null;

        const assignment = await FeeAssignment.findOne({
          student: childId, academicYear, isActive: true,
        }).populate('feeStructure', 'name monthlyAmount oneTimeAmount feeHeads');

        if (!assignment) return { student, assignment: null, pendingMonths: [], totalDue: 0, totalPaid: 0 };

        const pendingMonths = assignment.monthlyStatus.filter(
          (m) => m.status === 'pending' || m.status === 'partial'
        );
        const paidMonths = assignment.monthlyStatus.filter((m) => m.status === 'paid');

        const totalDue = pendingMonths.reduce(
          (s, m) => s + (m.dueAmount - m.paidAmount + (m.lateFine || 0)), 0
        );
        const totalPaid = paidMonths.reduce((s, m) => s + m.paidAmount, 0);

        return {
          student,
          assignment: {
            _id:            assignment._id,
            feeStructure:   assignment.feeStructure,
            academicYear:   assignment.academicYear,
            discount:       assignment.discount,
            discountReason: assignment.discountReason,
          },
          monthlyStatus: assignment.monthlyStatus,
          pendingMonths,
          paidMonths,
          totalDue,
          totalPaid,
        };
      })
    );

    const valid         = children.filter(Boolean);
    const grandTotalDue = valid.reduce((s, c) => s + c.totalDue, 0);

    sendSuccess(res, 'Fee status fetched.', { children: valid, grandTotalDue, academicYear });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// GET /api/parent/receipts
// query: studentId, startDate, endDate, page, limit
// ─────────────────────────────────────────────────────────────
const getChildrenReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, studentId, startDate, endDate } = req.query;

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return sendError(res, 'Parent profile not found.', 404);

    // Scope to only this parent's children
    const ownChildIds = parent.children.map(String);
    let targetIds;

    if (studentId) {
      if (!ownChildIds.includes(String(studentId))) {
        return sendError(res, 'Access denied: student not linked to your account.', 403);
      }
      targetIds = [studentId];
    } else {
      targetIds = ownChildIds;
    }

    if (!targetIds.length) {
      return sendSuccess(res, 'No children linked.', [], { total: 0, page: 1, pages: 0, limit: Number(limit) });
    }

    const filter = { student: { $in: targetIds } };
    if (startDate) filter.issuedAt = { $gte: new Date(startDate) };
    if (endDate)   filter.issuedAt = { ...filter.issuedAt, $lte: new Date(endDate) };

    const total    = await Receipt.countDocuments(filter);
    const receipts = await Receipt.find(filter)
      .populate('student', 'firstName lastName admissionNo class')
      .populate('payment',  'amount paymentMode paymentDate razorpayPaymentId')
      .sort({ issuedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    sendSuccess(res, 'Receipts fetched.', receipts, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// POST /api/parent/pay/create-order
// body: { studentId, months: [{month, year}], amount }
// ─────────────────────────────────────────────────────────────
const createPaymentOrder = async (req, res, next) => {
  try {
    const { studentId, months, amount } = req.body;

    if (!studentId) return sendError(res, 'studentId is required.', 400);
    if (!amount || amount < 1) return sendError(res, 'Invalid amount.', 400);

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return sendError(res, 'Parent profile not found.', 404);

    if (!parent.children.map(String).includes(String(studentId))) {
      return sendError(res, 'Unauthorised: student not linked to your account.', 403);
    }

    const student = await Student.findById(studentId).select('firstName lastName admissionNo');
    if (!student) return sendError(res, 'Student not found.', 404);

    const order = await razorpay.orders.create({
      amount:   Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt:  `rcpt_${student.admissionNo}_${Date.now()}`,
      notes: {
        studentId:   String(studentId),
        studentName: `${student.firstName} ${student.lastName}`,
        parentId:    String(parent._id),
        months:      JSON.stringify(months || []),
      },
    });

    logger.info(`💳 Razorpay order created: ${order.id} | ${student.admissionNo} | ₹${amount}`);

    sendSuccess(res, 'Payment order created.', {
      orderId:    order.id,
      amount:     order.amount,        // in paise
      amountRs:   amount,              // in rupees (convenience)
      currency:   order.currency,
      receipt:    order.receipt,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      months:     months || [],
      keyId:      process.env.RAZORPAY_KEY_ID, // needed by frontend
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────
// POST /api/parent/pay/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         studentId, months, amount }
// ─────────────────────────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      months,
      amount,
    } = req.body;

    // 1 — Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      logger.warn(`⚠️  Invalid Razorpay signature — order: ${razorpay_order_id}`);
      return sendError(res, 'Payment verification failed: invalid signature.', 400);
    }

    // 2 — Guard against duplicate processing
    const existing = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) {
      return sendSuccess(res, 'Payment already recorded.', { payment: existing });
    }

    const student    = await Student.findById(studentId).select('firstName lastName admissionNo class fatherName guardianPhone');
    if (!student) return sendError(res, 'Student not found.', 404);

    const assignment = await FeeAssignment.findOne({ student: studentId, isActive: true });

    // 3 — Create Payment record
    const payment = await Payment.create({
      student:           studentId,
      feeAssignment:     assignment?._id,
      amount:            Number(amount),
      paymentMode:       'online',
      paymentDate:       new Date(),
      status:            'completed',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      forMonths:         months || [],
      description:       'Online fee payment via Razorpay',
      collectedBy:       req.user._id,
    });

    // 4 — Update FeeAssignment monthly slots
    if (assignment && months?.length) {
      const perMonth = Number(amount) / months.length;
      for (const m of months) {
        const slot = assignment.monthlyStatus.find(
          (s) => s.month === m.month && s.year === m.year
        );
        if (slot) {
          slot.paidAmount += perMonth;
          slot.status     = slot.paidAmount >= slot.dueAmount ? 'paid' : 'partial';
          slot.paidDate   = new Date();
          slot.payment    = payment._id;
        }
      }
      await assignment.save();
    }

    // 5 — Generate receipt number & create Receipt record
    const receiptNo = await generateReceiptNo();

    const receipt = await Receipt.create({
      receiptNo,
      payment:         payment._id,
      student:         studentId,
      studentSnapshot: {
        name:          `${student.firstName} ${student.lastName}`,
        admissionNo:   student.admissionNo,
        class:         student.class,
        fatherName:    student.fatherName,
        guardianPhone: student.guardianPhone,
      },
      amount:       Number(amount),
      paymentMode:  'online',
      paymentDate:  new Date(),
      academicYear: assignment?.academicYear || currentAcademicYear(),
      forMonths:    months || [],
      generatedBy:  req.user._id,
      issuedAt:     new Date(),
    });

    // Link receipt back to payment
    payment.receipt = receipt._id;
    await payment.save();

    logger.info(`✅ Online payment verified: ${razorpay_payment_id} | ₹${amount} | Receipt: ${receiptNo}`);

    sendSuccess(res, 'Payment verified and receipt generated.', {
      payment,
      receipt: { _id: receipt._id, receiptNo, issuedAt: receipt.issuedAt },
    });
  } catch (err) { next(err); }
};

module.exports = {
  getParentProfile,
  updateParentProfile,
  getChildrenFeeStatus,
  getChildrenReceipts,
  createPaymentOrder,
  verifyPayment,
};