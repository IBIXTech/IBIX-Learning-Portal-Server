const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    question: { type: String, required: true, trim: true },
    option_1: { type: String, required: true, trim: true },
    option_2: { type: String, required: true, trim: true },
    option_3: { type: String, required: true, trim: true },
    option_4: { type: String, required: true, trim: true },
    answer: { type: Number, required: true, enum: [1, 2, 3, 4] },
    explanation: { type: String, trim: true },
    gc: { type: String, required: true },
    order: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mcq", mcqSchema);
