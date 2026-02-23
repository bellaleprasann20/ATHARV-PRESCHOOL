// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, getUsers, deactivateUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/register', protect, adminOnly, register);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/deactivate', protect, adminOnly, deactivateUser);

module.exports = router;