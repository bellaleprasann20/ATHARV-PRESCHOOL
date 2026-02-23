const FeeStructure = require('../models/FeeStructure');
const FeeAssignment = require('../models/FeeAssignment');
const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// Fee Structures CRUD
const getFeeStructures = async (req, res, next) => {
  try {
    const { class: cls, academicYear, isActive } = req.query;
    const query = {};
    if (cls) query.class = cls;
    if (academicYear) query.academicYear = academicYear;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const structures = await FeeStructure.find(query).sort({ createdAt: -1 });
    sendSuccess(res, 'Fee structures fetched.', structures);
  } catch (error) { next(error); }
};

const getFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);
    if (!structure) return sendError(res, 'Fee structure not found.', 404);
    sendSuccess(res, 'Fee structure fetched.', structure);
  } catch (error) { next(error); }
};

const createFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.create(req.body);
    sendSuccess(res, 'Fee structure created.', structure, null, 201);
  } catch (error) { next(error); }
};

const updateFeeStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!structure) return sendError(res, 'Fee structure not found.', 404);
    sendSuccess(res, 'Fee structure updated.', structure);
  } catch (error) { next(error); }
};

const deleteFeeStructure = async (req, res, next) => {
  try {
    await FeeStructure.findByIdAndUpdate(req.params.id, { isActive: false });
    sendSuccess(res, 'Fee structure deactivated.');
  } catch (error) { next(error); }
};

// Fee Assignments
const assignFeeToStudent = async (req, res, next) => {
  try {
    const { studentId, feeStructureId, academicYear, discount, discountReason } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'Student not found.', 404);

    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) return sendError(res, 'Fee structure not found.', 404);

    // Check if already assigned for this year
    const existing = await FeeAssignment.findOne({ student: studentId, academicYear });
    if (existing) return sendError(res, 'Fee already assigned for this academic year.', 400);

    // Build monthly status for full academic year (June to May)
    const months = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5];
    const startYear = parseInt(academicYear.split('-')[0]);
    const monthlyFee = structure.totalMonthly;
    const discountAmount = (monthlyFee * (discount || 0)) / 100;

    const monthlyStatus = months.map(month => {
      const year = month >= 6 ? startYear : startYear + 1;
      return {
        month,
        year,
        status: 'pending',
        dueAmount: monthlyFee - discountAmount,
        paidAmount: 0,
        dueDate: new Date(year, month - 1, structure.dueDay),
        lateFine: 0,
      };
    });

    const assignment = await FeeAssignment.create({
      student: studentId,
      feeStructure: feeStructureId,
      academicYear,
      discount: discount || 0,
      discountReason,
      monthlyStatus,
    });

    sendSuccess(res, 'Fee assigned to student successfully.', assignment, null, 201);
  } catch (error) { next(error); }
};

const getStudentFeeAssignment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;
    const query = { student: studentId };
    if (academicYear) query.academicYear = academicYear;

    const assignment = await FeeAssignment.findOne(query)
      .populate('feeStructure')
      .populate('student', 'firstName lastName admissionNo class');

    if (!assignment) return sendError(res, 'No fee assignment found.', 404);
    sendSuccess(res, 'Fee assignment fetched.', assignment);
  } catch (error) { next(error); }
};

// Get all students with due fees
const getDueFees = async (req, res, next) => {
  try {
    const { class: cls, month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();

    const assignments = await FeeAssignment.find({ isActive: true })
      .populate({
        path: 'student',
        match: cls ? { class: cls, status: 'active' } : { status: 'active' },
        select: 'firstName lastName admissionNo class guardianPhone',
      })
      .populate('feeStructure', 'name');

    const dues = assignments
      .filter(a => a.student) // remove null populated students
      .map(a => {
        const pendingMonths = a.monthlyStatus.filter(
          m => m.status === 'pending' || m.status === 'partial'
        );
        const totalDue = pendingMonths.reduce(
          (sum, m) => sum + (m.dueAmount - m.paidAmount + m.lateFine), 0
        );
        return { student: a.student, pendingMonths, totalDue, assignment: a._id };
      })
      .filter(d => d.totalDue > 0);

    sendSuccess(res, 'Due fees fetched.', dues, { total: dues.length });
  } catch (error) { next(error); }
};

module.exports = {
  getFeeStructures, getFeeStructure, createFeeStructure, updateFeeStructure, deleteFeeStructure,
  assignFeeToStudent, getStudentFeeAssignment, getDueFees,
};