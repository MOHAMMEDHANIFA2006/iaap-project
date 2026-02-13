const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { getAllStudents, addMarks, addAttendance } = require("../controllers/facultyController");

// All routes require authentication and faculty/teacher role
router.use(authMiddleware);
router.use(authorizeRoles("faculty", "teacher"));

// Get all students
router.get("/students", getAllStudents);

// Add marks
router.post("/marks", addMarks);

// Add attendance
router.post("/attendance", addAttendance);

module.exports = router;
