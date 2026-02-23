const { sendError } = require('../utils/sendResponse');

// Only allow specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

// Shorthand guards
const adminOnly = authorize('admin');
const adminOrTeacher = authorize('admin', 'teacher');
const parentOnly = authorize('parent');

module.exports = { authorize, adminOnly, adminOrTeacher, parentOnly };