const mongoose = require("mongoose");

const url = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Failed to connect");
    process.exit(1);
  }
};

module.exports = connectDB;
