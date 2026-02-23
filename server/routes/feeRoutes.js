const express = require('express');
const router = express.Router();
const {
  getFeeStructures, getFeeStructure, createFeeStructure, updateFeeStructure, deleteFeeStructure,
  assignFeeToStudent, getStudentFeeAssignment, getDueFees,
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, adminOrTeacher } = require('../middleware/roleMiddleware');

router.use(protect);

// Fee Structures
router.route('/structures')
  .get(adminOrTeacher, getFeeStructures)
  .post(adminOnly, createFeeStructure);

router.route('/structures/:id')
  .get(adminOrTeacher, getFeeStructure)
  .put(adminOnly, updateFeeStructure)
  .delete(adminOnly, deleteFeeStructure);

// Assignments
router.post('/assign', adminOnly, assignFeeToStudent);
router.get('/assignment/:studentId', adminOrTeacher, getStudentFeeAssignment);
router.get('/dues', adminOrTeacher, getDueFees);

module.exports = router;