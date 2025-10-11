// models/Student.js
const mongoose = require("mongoose");

const cheatSheetSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  level: String,
  link: String,
  course: String,
});

module.exports = mongoose.model("Cheat Sheet", cheatSheetSchema);
