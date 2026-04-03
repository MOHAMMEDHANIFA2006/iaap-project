const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getFullStudentAnalytics } = require("../controllers/analyticsController");
const mongoose = require("mongoose");

// All analytics routes require authentication
router.use(authMiddleware);

// Custom middleware: Allow faculty/teacher/admin for any student, or students for their own data
const checkAnalyticsAccess = (req, res, next) => {
  const { studentId } = req.params;
  const userRole = req.user.role;
  const userStudentId = req.user.studentId;

  // Faculty, teacher, and admin can access any student's analytics
  if (["faculty", "teacher", "admin"].includes(userRole)) {
    return next();
  }

  // Students can only access their own analytics
  if (userRole === "student") {
    if (!userStudentId || userStudentId.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied - you can only view your own analytics" });
    }
    return next();
  }

  return res.status(403).json({ message: "Access denied - insufficient permissions" });
};

// Analytics routes accessible by faculty, teacher, admin, and students (their own data)
router.get("/full/:studentId", checkAnalyticsAccess, getFullStudentAnalytics);

module.exports = router;
