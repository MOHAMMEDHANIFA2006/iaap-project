const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  department: String,
  semester: Number,
  cgpa: Number
});

module.exports = mongoose.model("Student", studentSchema);
