const Payment = require('../models/Payment');
const Student = require('../models/Student');
const FeeAssignment = require('../models/FeeAssignment');
const { sendSuccess } = require('../utils/sendResponse');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Monthly collection report
const getMonthlyReport = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const report = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { month: { $month: '$paymentDate' }, mode: '$paymentMode' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Reshape for chart-friendly format
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      cash: 0,
      online: 0,
      cheque: 0,
      upi: 0,
      count: 0,
    }));

    report.forEach(r => {
      const m = months[r._id.month - 1];
      m.total += r.total;
      m.count += r.count;
      m[r._id.mode] = (m[r._id.mode] || 0) + r.total;
    });

    const totalCollection = months.reduce((s, m) => s + m.total, 0);
    sendSuccess(res, 'Monthly report fetched.', { months, totalCollection, year: Number(year) });
  } catch (error) { next(error); }
};

// Class-wise fee report
const getClassWiseReport = async (req, res, next) => {
  try {
    const { academicYear } = req.query;
    const classes = ['Nursery', 'LKG', 'UKG', 'Daycare'];

    const report = await Promise.all(
      classes.map(async (cls) => {
        const students = await Student.find({ class: cls, status: 'active' }).select('_id');
        const studentIds = students.map(s => s._id);

        const collected = await Payment.aggregate([
          { $match: { student: { $in: studentIds }, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);

        const assignments = await FeeAssignment.find({ student: { $in: studentIds } });
        const totalDue = assignments.reduce((sum, a) => {
          return sum + a.monthlyStatus
            .filter(m => m.status !== 'paid' && m.status !== 'waived')
            .reduce((s, m) => s + (m.dueAmount - m.paidAmount), 0);
        }, 0);

        return {
          class: cls,
          studentCount: students.length,
          collected: collected[0]?.total || 0,
          paymentCount: collected[0]?.count || 0,
          pending: totalDue,
        };
      })
    );

    sendSuccess(res, 'Class-wise report fetched.', report);
  } catch (error) { next(error); }
};

// Defaulters list (students with overdue fees)
const getDefaulters = async (req, res, next) => {
  try {
    const { class: cls } = req.query;

    const studentQuery = { status: 'active' };
    if (cls) studentQuery.class = cls;

    const students = await Student.find(studentQuery).select('firstName lastName admissionNo class guardianPhone guardianEmail');

    const defaulters = [];

    for (const student of students) {
      const assignment = await FeeAssignment.findOne({ student: student._id, isActive: true });
      if (!assignment) continue;

      const now = new Date();
      const overdueMonths = assignment.monthlyStatus.filter(m => {
        const dueDate = new Date(m.dueDate);
        return (m.status === 'pending' || m.status === 'partial') && dueDate < now;
      });

      if (overdueMonths.length > 0) {
        const totalOverdue = overdueMonths.reduce((s, m) => s + (m.dueAmount - m.paidAmount + m.lateFine), 0);
        defaulters.push({
          student: {
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            admissionNo: student.admissionNo,
            class: student.class,
            phone: student.guardianPhone,
            email: student.guardianEmail,
          },
          overdueMonths: overdueMonths.length,
          totalOverdue,
          months: overdueMonths,
        });
      }
    }

    defaulters.sort((a, b) => b.totalOverdue - a.totalOverdue);
    sendSuccess(res, 'Defaulters list fetched.', defaulters, { total: defaulters.length });
  } catch (error) { next(error); }
};

// Export to Excel
const exportToExcel = async (req, res, next) => {
  try {
    const { type, startDate, endDate, class: cls } = req.query;

    let data = [];
    let sheetName = 'Report';

    if (type === 'payments') {
      const query = { status: 'completed' };
      if (startDate) query.paymentDate = { $gte: new Date(startDate) };
      if (endDate) query.paymentDate = { ...query.paymentDate, $lte: new Date(endDate) };

      const payments = await Payment.find(query)
        .populate('student', 'firstName lastName admissionNo class')
        .populate('receipt', 'receiptNo');

      data = payments.map(p => ({
        'Receipt No': p.receipt?.receiptNo || '-',
        'Student Name': p.student ? `${p.student.firstName} ${p.student.lastName}` : '-',
        'Admission No': p.student?.admissionNo || '-',
        'Class': p.student?.class || '-',
        'Amount (₹)': p.amount,
        'Payment Mode': p.paymentMode,
        'Date': new Date(p.paymentDate).toLocaleDateString('en-IN'),
        'Status': p.status,
      }));
      sheetName = 'Payments';

    } else if (type === 'defaulters') {
      const students = await Student.find({ status: 'active', ...(cls ? { class: cls } : {}) });
      for (const student of students) {
        const assignment = await FeeAssignment.findOne({ student: student._id });
        if (!assignment) continue;
        const due = assignment.monthlyStatus
          .filter(m => m.status === 'pending' || m.status === 'partial')
          .reduce((s, m) => s + (m.dueAmount - m.paidAmount), 0);
        if (due > 0) {
          data.push({
            'Student Name': `${student.firstName} ${student.lastName}`,
            'Admission No': student.admissionNo,
            'Class': student.class,
            'Phone': student.guardianPhone,
            'Pending Amount (₹)': due,
          });
        }
      }
      sheetName = 'Defaulters';

    } else if (type === 'students') {
      const students = await Student.find({ status: 'active', ...(cls ? { class: cls } : {}) });
      data = students.map(s => ({
        'Admission No': s.admissionNo,
        'Name': `${s.firstName} ${s.lastName}`,
        'Class': s.class,
        'DOB': s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN') : '',
        'Gender': s.gender,
        "Father's Name": s.fatherName,
        'Phone': s.guardianPhone,
        'Email': s.guardianEmail,
        'Status': s.status,
      }));
      sheetName = 'Students';
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const filename = `${sheetName}_${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../uploads', filename);
    XLSX.writeFile(wb, filepath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const stream = fs.createReadStream(filepath);
    stream.pipe(res);
    stream.on('end', () => fs.unlinkSync(filepath));
  } catch (error) { next(error); }
};

// Dashboard summary stats
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalStudents,
      monthlyCollection,
      totalCollection,
      pendingDues,
      recentPayments,
    ] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      FeeAssignment.aggregate([
        { $unwind: '$monthlyStatus' },
        { $match: { 'monthlyStatus.status': { $in: ['pending', 'partial'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$monthlyStatus.dueAmount', '$monthlyStatus.paidAmount'] } } } },
      ]),
      Payment.find({ status: 'completed' })
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate('student', 'firstName lastName class admissionNo')
        .populate('receipt', 'receiptNo'),
    ]);

    sendSuccess(res, 'Dashboard stats fetched.', {
      totalStudents,
      monthlyCollection: monthlyCollection[0]?.total || 0,
      monthlyPaymentCount: monthlyCollection[0]?.count || 0,
      totalCollection: totalCollection[0]?.total || 0,
      pendingDues: pendingDues[0]?.total || 0,
      recentPayments,
    });
  } catch (error) { next(error); }
};

module.exports = { getMonthlyReport, getClassWiseReport, getDefaulters, exportToExcel, getDashboardStats };