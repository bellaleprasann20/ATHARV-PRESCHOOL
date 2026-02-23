const express = require('express');
const router = express.Router();
const {
  getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentStats
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, adminOrTeacher } = require('../middleware/roleMiddleware');
const { uploadPhoto } = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/stats', adminOrTeacher, getStudentStats);
router.route('/')
  .get(adminOrTeacher, getStudents)
  .post(adminOnly, uploadPhoto.single('photo'), createStudent);

router.route('/:id')
  .get(adminOrTeacher, getStudent)
  .put(adminOnly, uploadPhoto.single('photo'), updateStudent)
  .delete(adminOnly, deleteStudent);

module.exports = router;