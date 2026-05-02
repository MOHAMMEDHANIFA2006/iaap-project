const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const Student = require("../models/Student");

router.use(authMiddleware);
router.use(authorizeRoles("student"));

router.put("/cgpa", async (req, res) => {
  try {
    const { cgpa } = req.body;
    const studentId = req.user.studentId;

    if (typeof cgpa !== "number" || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ message: "Invalid CGPA value" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.cgpa = cgpa;
    await student.save();

    res.json({ message: "CGPA updated successfully", cgpa: student.cgpa });
  } catch (err) {
    res.status(500).json({ message: "Error updating CGPA" });
  }
});

module.exports = router;