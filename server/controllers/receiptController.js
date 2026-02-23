const path = require('path');
const fs = require('fs');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const generateReceiptNo = require('../utils/generateReceiptNo');
const { generateReceiptPDF } = require('../services/pdfService');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// Internal function to create receipt (called from paymentController)
const createReceipt = async (payment, student, userId) => {
  const receiptNo = await generateReceiptNo();

  const receipt = await Receipt.create({
    receiptNo,
    payment: payment._id,
    student: student._id,
    studentSnapshot: {
      name: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      class: student.class,
      section: student.section,
      fatherName: student.fatherName,
      guardianPhone: student.guardianPhone,
    },
    amount: payment.amount,
    paymentMode: payment.paymentMode,
    paymentDate: payment.paymentDate,
    academicYear: payment.academicYear,
    forMonths: payment.forMonths,
    feeBreakdown: payment.feeBreakdown,
    lateFine: payment.lateFine,
    discount: payment.discount,
    remarks: payment.remarks,
    generatedBy: userId,
  });

  // Generate PDF
  const receiptDir = path.join(__dirname, '../receipts');
  if (!fs.existsSync(receiptDir)) fs.mkdirSync(receiptDir, { recursive: true });

  const pdfFilename = `${receiptNo.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  const pdfPath = path.join(receiptDir, pdfFilename);

  await generateReceiptPDF(receipt, pdfPath);

  receipt.pdfPath = pdfPath;
  receipt.pdfUrl = `/api/receipts/${receipt._id}/download`;
  await receipt.save();

  return receipt;
};

// @route GET /api/receipts
const getReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, studentId, startDate, endDate } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (startDate || endDate) {
      query.issuedAt = {};
      if (startDate) query.issuedAt.$gte = new Date(startDate);
      if (endDate) query.issuedAt.$lte = new Date(endDate);
    }

    const total = await Receipt.countDocuments(query);
    const receipts = await Receipt.find(query)
      .populate('student', 'firstName lastName admissionNo class')
      .populate('generatedBy', 'name')
      .sort({ issuedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendSuccess(res, 'Receipts fetched.', receipts, {
      total, page: Number(page), pages: Math.ceil(total / limit),
    });
  } catch (error) { next(error); }
};

// @route GET /api/receipts/:id
const getReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('student')
      .populate('payment')
      .populate('generatedBy', 'name');
    if (!receipt) return sendError(res, 'Receipt not found.', 404);
    sendSuccess(res, 'Receipt fetched.', receipt);
  } catch (error) { next(error); }
};

// @route GET /api/receipts/:id/download
const downloadReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('student');
    if (!receipt) return sendError(res, 'Receipt not found.', 404);

    // Re-generate if PDF missing
    if (!receipt.pdfPath || !fs.existsSync(receipt.pdfPath)) {
      const receiptDir = path.join(__dirname, '../receipts');
      const pdfFilename = `${receipt.receiptNo.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const pdfPath = path.join(receiptDir, pdfFilename);
      await generateReceiptPDF(receipt, pdfPath);
      receipt.pdfPath = pdfPath;
      await receipt.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${receipt.receiptNo}.pdf"`);
    fs.createReadStream(receipt.pdfPath).pipe(res);
  } catch (error) { next(error); }
};

module.exports = { createReceipt, getReceipts, getReceipt, downloadReceipt };