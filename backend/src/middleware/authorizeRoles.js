/**
 * Middleware to restrict access to users with specific roles.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorizeRoles('ADMIN'), handler);
 *
 * @param {...string} allowedRoles - One or more allowed role strings.
 */
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (!userRole) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!allowedRoles.includes(userRole)) {
    // Log the authorization failure
    const { logAction } = require('../utils/auditLogger');
    logAction(
      userId,
      'ACCESS_DENIED',
      req.originalUrl,
      null,
      'FAILED',
      `User with role ${userRole} attempted to access ${req.method} ${req.originalUrl}`
    );

    return res.status(403).json({ message: 'You do not have permission to access this resource' });
  }

  next();
};

module.exports = authorizeRoles;
