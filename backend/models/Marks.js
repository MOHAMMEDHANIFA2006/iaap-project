const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  subject: String,
  internal: Number,
  external: Number
});

module.exports = mongoose.model("Marks", marksSchema);
