/**
 * Role-Based Authorization Middleware
 * Checks if the authenticated user has one of the authorized roles
 */

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied - insufficient permissions" });
    }
  };
};
