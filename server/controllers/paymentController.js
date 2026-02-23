const crypto = require('crypto');
const Payment = require('../models/Payment');
const FeeAssignment = require('../models/FeeAssignment');
const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const razorpay = require('../config/razorpay');
const { createReceipt } = require('./receiptController');

// @route POST /api/payments/collect  (Cash/Cheque/UPI - Admin)
const collectPayment = async (req, res, next) => {
  try {
    const {
      studentId, amount, paymentMode, forMonths, feeBreakdown,
      lateFine = 0, discount = 0, remarks, chequeNo, chequeDate, bankName
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'Student not found.', 404);

    const totalBeforeDiscount = amount + discount;

    const payment = await Payment.create({
      student: studentId,
      amount,
      paymentMode,
      paymentDate: new Date(),
      status: 'completed',
      forMonths,
      feeBreakdown,
      lateFine,
      discount,
      totalBeforeDiscount,
      remarks,
      collectedBy: req.user._id,
      academicYear: student.academicYear,
      ...(paymentMode === 'cheque' && { chequeNo, chequeDate, bankName, chequeStatus: 'pending' }),
    });

    // Update fee assignment monthly status
    if (forMonths && forMonths.length > 0) {
      const assignment = await FeeAssignment.findOne({
        student: studentId,
        academicYear: student.academicYear,
      });

      if (assignment) {
        for (const fm of forMonths) {
          const monthEntry = assignment.monthlyStatus.find(
            m => m.month === fm.month && m.year === fm.year
          );
          if (monthEntry) {
            monthEntry.paidAmount = fm.amount;
            monthEntry.status = fm.amount >= monthEntry.dueAmount ? 'paid' : 'partial';
            monthEntry.paidDate = new Date();
            monthEntry.payment = payment._id;
          }
        }
        await assignment.save();
      }
    }

    // Auto-generate receipt
    const receipt = await createReceipt(payment, student, req.user._id);
    payment.receipt = receipt._id;
    await payment.save();

    sendSuccess(res, 'Payment recorded and receipt generated.', {
      payment,
      receipt,
    }, null, 201);
  } catch (error) { next(error); }
};

// @route POST /api/payments/create-order (Razorpay online)
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, studentId, currency = 'INR' } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency,
      receipt: `rcpt_${studentId}_${Date.now()}`,
      notes: { studentId },
    };

    const order = await razorpay.orders.create(options);
    sendSuccess(res, 'Razorpay order created.', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) { next(error); }
};

// @route POST /api/payments/verify-online (Razorpay verification)
const verifyOnlinePayment = async (req, res, next) => {
  try {
    const {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      studentId, amount, forMonths, feeBreakdown, lateFine = 0, discount = 0
    } = req.body;

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return sendError(res, 'Payment verification failed. Invalid signature.', 400);
    }

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'Student not found.', 404);

    const payment = await Payment.create({
      student: studentId,
      amount,
      paymentMode: 'online',
      paymentDate: new Date(),
      status: 'completed',
      forMonths,
      feeBreakdown,
      lateFine,
      discount,
      totalBeforeDiscount: amount + discount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      academicYear: student.academicYear,
    });

    // Update fee assignment
    if (forMonths && forMonths.length > 0) {
      const assignment = await FeeAssignment.findOne({ student: studentId, academicYear: student.academicYear });
      if (assignment) {
        for (const fm of forMonths) {
          const monthEntry = assignment.monthlyStatus.find(m => m.month === fm.month && m.year === fm.year);
          if (monthEntry) {
            monthEntry.paidAmount = fm.amount;
            monthEntry.status = fm.amount >= monthEntry.dueAmount ? 'paid' : 'partial';
            monthEntry.paidDate = new Date();
            monthEntry.payment = payment._id;
          }
        }
        await assignment.save();
      }
    }

    const receipt = await createReceipt(payment, student, studentId);
    payment.receipt = receipt._id;
    await payment.save();

    sendSuccess(res, 'Payment verified successfully. Receipt generated.', { payment, receipt });
  } catch (error) { next(error); }
};

// @route GET /api/payments
const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, studentId, paymentMode, status, startDate, endDate, class: cls } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (paymentMode) query.paymentMode = paymentMode;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    let paymentQuery = Payment.find(query)
      .populate({ path: 'student', match: cls ? { class: cls } : {}, select: 'firstName lastName admissionNo class' })
      .populate('collectedBy', 'name')
      .populate('receipt', 'receiptNo')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const [payments, total] = await Promise.all([
      paymentQuery,
      Payment.countDocuments(query),
    ]);

    sendSuccess(res, 'Payments fetched.', payments.filter(p => p.student), {
      total, page: Number(page), pages: Math.ceil(total / limit),
    });
  } catch (error) { next(error); }
};

// @route GET /api/payments/:id
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student')
      .populate('receipt')
      .populate('collectedBy', 'name');
    if (!payment) return sendError(res, 'Payment not found.', 404);
    sendSuccess(res, 'Payment fetched.', payment);
  } catch (error) { next(error); }
};

module.exports = { collectPayment, createRazorpayOrder, verifyOnlinePayment, getPayments, getPayment };