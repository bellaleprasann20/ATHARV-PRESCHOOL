const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @route GET /api/students
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search, class: cls, status, academicYear
    } = req.query;

    const query = {};
    if (cls) query.class = cls;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { guardianPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('parent', 'fatherName motherName primaryPhone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendSuccess(res, 'Students fetched.', students, {
      total, page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (error) { next(error); }
};

// @route GET /api/students/:id
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parent');
    if (!student) return sendError(res, 'Student not found.', 404);
    sendSuccess(res, 'Student fetched.', student);
  } catch (error) { next(error); }
};

// @route POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const studentData = { ...req.body };
    if (req.file) {
      studentData.photo = `/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.create(studentData);
    sendSuccess(res, 'Student added successfully.', student, null, 201);
  } catch (error) { next(error); }
};

// @route PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = `/uploads/photos/${req.file.filename}`;
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id, updateData, { new: true, runValidators: true }
    );
    if (!student) return sendError(res, 'Student not found.', 404);
    sendSuccess(res, 'Student updated successfully.', student);
  } catch (error) { next(error); }
};

// @route DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, 'Student not found.', 404);
    // Soft delete - mark as inactive
    student.status = 'inactive';
    await student.save();
    sendSuccess(res, 'Student deactivated successfully.');
  } catch (error) { next(error); }
};

// @route GET /api/students/stats
const getStudentStats = async (req, res, next) => {
  try {
    const stats = await Student.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 },
          boys: { $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] } },
          girls: { $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = await Student.countDocuments({ status: 'active' });
    sendSuccess(res, 'Student stats fetched.', { total, byClass: stats });
  } catch (error) { next(error); }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentStats };