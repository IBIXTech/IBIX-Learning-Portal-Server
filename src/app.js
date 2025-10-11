require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const express = require("express");
const connectDB = require("./config/db");
const Student = require("./models/Student");
const CheatSheet = require("./models/CheatSheet");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleware/JWTVerification");

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);
app.use(express.json());

// Check if student exists in database
app.post("/api/auth/check-student", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find student by email in MongoDB
    const student = await Student.findOne({ email: email.toLowerCase() });
    const token = jwt.sign(
      { id: student.UID, email: student.email, name: student.studentName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    if (student) {
      return res.json({
        success: true,
        exists: true,
        token,
        student: {
          UID: student.UID,
          studentName: student.studentName,
          email: student.email,
          program: student.program,
          joinedDate: student.joinedDate,
        },
      });
    } else {
      return res.json({
        success: true,
        exists: false,
        message: "Student not found in database",
      });
    }
  } catch (error) {
    console.error("Error checking student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/api/cheat-sheet", async (req, res) => {
  try {
    const { course, gc } = req.body;

    if (!course || !gc) {
      return res.status(400).json({
        success: false,
        message: "course & GC required!",
      });
    }

    // Find cheat sheet entries by course and GC (case-insensitive)
    const cheatSheets = await CheatSheet.find({
      course: { $regex: `^${course}$`, $options: "i" },
      gc: { $regex: `^${gc}$`, $options: "i" },
    });

    if (!cheatSheets || cheatSheets.length === 0) {
      return res.json({
        success: true,
        exists: false,
        message: `No cheat sheet found for course "${course}" & GC "${gc}"`,
      });
    }

    // Prepare the response for the requested GC
    const responseData = {
      [gc.toUpperCase()]: {
        classes: cheatSheets.map((item) => ({
          id: item.id || item._id.toString(),
          title: item.title || "",
          duration: item.duration || "",
          level: item.level || "",
          link: item.link || "",
          course: item.course || "",
        })),
      },
    };

    return res.json({
      success: true,
      exists: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching cheat sheet:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
