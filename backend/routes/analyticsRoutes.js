const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getFullStudentAnalytics } = require("../controllers/analyticsController");
const Student = require("../models/Student");

// 🔹 TEMP ROUTE TO VIEW STUDENTS (No Auth Needed)
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});
const Marks = require("../models/Marks");

// 🔹 TEMP ROUTE TO VIEW ALL MARKS
router.get("/marks", async (req, res) => {
  try {
    const marks = await Marks.find();
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching marks" });
  }
});


// 🔹 PROTECTED ANALYTICS ROUTE
router.get("/full/:studentId", authMiddleware, getFullStudentAnalytics);

module.exports = router;
