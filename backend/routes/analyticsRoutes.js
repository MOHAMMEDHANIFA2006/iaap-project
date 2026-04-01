const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { getFullStudentAnalytics } = require("../controllers/analyticsController");

// All analytics routes require authentication
router.use(authMiddleware);

// Analytics routes accessible by faculty, teacher, and admin
router.get("/full/:studentId", authorizeRoles("faculty", "teacher", "admin"), getFullStudentAnalytics);

module.exports = router;
