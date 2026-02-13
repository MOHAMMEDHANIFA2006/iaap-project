const mongoose = require("mongoose");
const Student = require("../models/Student");
const Marks = require("../models/Marks");
const Attendance = require("../models/Attendance");

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

// Add marks for a student
exports.addMarks = async (req, res) => {
  try {
    const { studentId, subject, internal, external } = req.body;

    // Validation
    if (!studentId || !subject || typeof internal !== "number" || typeof external !== "number") {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if marks for this subject already exist
    const existingMarks = await Marks.findOne({ studentId, subject });
    if (existingMarks) {
      // Update existing marks
      existingMarks.internal = internal;
      existingMarks.external = external;
      await existingMarks.save();
      return res.json({ message: "Marks updated successfully", data: existingMarks });
    }

    // Create new marks
    const marks = new Marks({
      studentId,
      subject,
      internal,
      external
    });

    await marks.save();
    res.json({ message: "Marks added successfully", data: marks });
  } catch (err) {
    res.status(500).json({ message: "Error adding marks" });
  }
};

// Add attendance for a student
exports.addAttendance = async (req, res) => {
  try {
    const { studentId, subject, attendancePercentage } = req.body;

    // Validation
    if (!studentId || !subject || typeof attendancePercentage !== "number") {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    if (attendancePercentage < 0 || attendancePercentage > 100) {
      return res.status(400).json({ message: "Attendance must be between 0 and 100" });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if attendance for this subject already exists
    const existingAttendance = await Attendance.findOne({ studentId, subject });
    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.attendancePercentage = attendancePercentage;
      await existingAttendance.save();
      return res.json({ message: "Attendance updated successfully", data: existingAttendance });
    }

    // Create new attendance
    const attendance = new Attendance({
      studentId,
      subject,
      attendancePercentage
    });

    await attendance.save();
    res.json({ message: "Attendance added successfully", data: attendance });
  } catch (err) {
    res.status(500).json({ message: "Error adding attendance" });
  }
};
