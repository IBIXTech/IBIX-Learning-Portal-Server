// models/Student.js
const mongoose = require("mongoose");

const techProSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  level: String,
  link: String,
  course: String,
  cheatSheet: String,
  codeSol: String,
  status: String,
  tag: String,
});

module.exports = mongoose.model("Tech Pro", techProSchema);
