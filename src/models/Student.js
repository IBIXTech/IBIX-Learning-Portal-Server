// models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  UID: String,
  studentName: String,
  email: String,
  program: String,
  joinedDate: String,
});

module.exports = mongoose.model("Student", studentSchema);
