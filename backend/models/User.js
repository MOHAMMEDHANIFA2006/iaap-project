const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "faculty", "teacher", "admin"],
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }
});

module.exports = mongoose.model("User", userSchema);
