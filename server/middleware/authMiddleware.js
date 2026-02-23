const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/sendResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized. Please login.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendError(res, 'User not found.', 401);
    }

    if (!req.user.isActive) {
      return sendError(res, 'Account has been deactivated.', 401);
    }

    next();
  } catch (error) {
    return sendError(res, 'Token is invalid or expired.', 401);
  }
};

module.exports = { protect };