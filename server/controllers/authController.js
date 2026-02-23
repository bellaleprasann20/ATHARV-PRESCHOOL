const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Register a new user (Admin only creates users)
// @route   POST /api/auth/register
// @access  Private (Admin)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered.', 400);
    }

    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id, user.role);

    sendSuccess(res, 'User registered successfully.', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token,
    }, null, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password.', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated. Contact admin.', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Update last login without triggering pre-save hook
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id, user.role);

    sendSuccess(res, 'Login successful.', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      lastLogin: user.lastLogin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, 'User profile fetched.', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    sendSuccess(res, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    sendSuccess(res, 'Users fetched.', users);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   PUT /api/auth/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return sendError(res, 'User not found.', 404);
    sendSuccess(res, 'User deactivated successfully.', user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword, getUsers, deactivateUser };