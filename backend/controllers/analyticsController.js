const mongoose = require("mongoose");
const Student = require("../models/Student");
const Marks = require("../models/Marks");
const Attendance = require("../models/Attendance");

exports.getFullStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const objectId = new mongoose.Types.ObjectId(studentId);

    const student = await Student.findById(objectId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const marks = await Marks.find({ studentId: objectId });
    const attendance = await Attendance.find({ studentId: objectId });

    let total = 0;
    marks.forEach(m => total += m.internal + m.external);

    const averageMarks = marks.length ? total / marks.length : 0;
    // Count arrears: subjects where total marks < passing threshold
    const PASSING_MARKS = 40;
    const arrearCount = marks.filter(m => (m.internal + m.external) < PASSING_MARKS).length;
    const lowAttendance = attendance.some(a => a.attendancePercentage < 75);

    let riskLevel = "Low";
    if (averageMarks < 50 || lowAttendance) riskLevel = "High";
    else if (averageMarks < 65) riskLevel = "Medium";

    res.json({
      student,
      averageMarks,
      arrearCount,
      riskLevel,
      marks,
      attendance
    });

  } catch (err) {
    res.status(500).json({ message: "Analytics error" });
  }
};
