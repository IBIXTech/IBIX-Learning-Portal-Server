import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    option_1: {
      type: String,
      required: true,
      trim: true,
    },

    option_2: {
      type: String,
      required: true,
      trim: true,
    },

    option_3: {
      type: String,
      required: true,
      trim: true,
    },

    option_4: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4], // Ensures answer index is valid
    },
    explanation: {
      type: String,
      trim: true,
    },
    gc: {
      type: String, // e.g. "GC1", "GC2"
      required: true,
    },
    order: {
      type: String, // e.g. "mcq1"
      required: true,
    },
  },
  { timestamps: true }
);

const Mcq = mongoose.model("Mcq", mcqSchema);

export default Mcq;
