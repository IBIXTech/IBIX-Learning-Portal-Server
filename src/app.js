require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const express = require("express");
const connectDB = require("./config/db");
const Student = require("./models/Student");
const TechProSheet = require("./models/TechPro");
const TechSmart = require("./models/TechSmart");
const MCQ = require("./models/MCQ");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleware/JWTVerification");

const app = express();
connectDB();

app.use(
  cors({
    origin: "https://learning.ibixqt.in",
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

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
    const { course, gc, uid, joinedDate } = req.body;
    // console.log("Student ID:", uid, "Joined Date:", joinedDate);

    if (!course || !gc || !uid || !joinedDate) {
      return res.status(400).json({
        success: false,
        message: "course, GC, UID, and joinedDate are required!",
      });
    }

    // Fetch cheat sheets based on course and GC
    let cheatSheets = null;

    if (course === "tech-pro") {
      cheatSheets = await TechProSheet.find({
        course: { $regex: `^${course}$`, $options: "i" },
        gc: { $regex: `^${gc}$`, $options: "i" },
      });
    } else {
      cheatSheets = await TechSmart.find({
        course: { $regex: `^${course}$`, $options: "i" },
        gc: { $regex: `^${gc}$`, $options: "i" },
      });
    }

    if (!cheatSheets || cheatSheets.length === 0) {
      return res.json({
        success: true,
        exists: false,
        message: `No cheat sheet found for course "${course}" & GC "${gc}"`,
      });
    }

    // -------------------------
    // 🌟 AUTO CLASS UNLOCK LOGIC
    // -------------------------
    const today = new Date();
    const joinDate = new Date(joinedDate);

    // Calculate difference in days between today and join date
    let diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));

    // Unlock starts tomorrow 6 PM for same-day joins
    const now = new Date();
    const today6PM = new Date();
    today6PM.setHours(18, 0, 0, 0);

    // If it's before 6 PM, don't count the current day
    if (now < today6PM) {
      diffDays -= 1;
    }

    // Handle cases
    let unlockCount = 0;

    if (diffDays < 0) {
      // Joined in the future (invalid)
      unlockCount = 0;
    } else if (diffDays === 0) {
      // Joined today → unlock starts tomorrow 6PM
      unlockCount = 0;
    } else {
      // Example rule: unlock 1 class per day
      unlockCount = Math.min(diffDays, cheatSheets.length);
    }

    // console.log(`Days since join: ${diffDays}, Unlock count: ${unlockCount}`);

    // Slice cheatSheets based on unlockCount
    const unlockedClasses = cheatSheets.slice(0, unlockCount);

    // Prepare structured response
    const responseData = {
      [gc.toUpperCase()]: {
        classes: unlockedClasses.map((item) => ({
          id: item.id || item._id.toString(),
          title: item.title || "",
          duration: item.duration || "",
          level: item.level || "",
          link: item.link || "",
          course: item.course || "",
          tag: item.tag || "",
          status: item.status || "",
          cheatSheet: item.cheatSheet || "",
          codeSol: item.codeSol || "",
        })),
      },
      nextUnlockInfo:
        unlockCount < cheatSheets.length
          ? "Next class unlocks today at 6 PM"
          : "All classes unlocked!",
    };

    // Final response
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

app.post("/api/mcqs", async (req, res) => {
  const { order } = req.body;

  try {
    // Find all matching questions
    const mcqs = await MCQ.find({ order });

    // Format the response
    const formattedMcqs = mcqs.map((item, index) => ({
      id: index + 1,
      question: item.question,
      options: [item.option_1, item.option_2, item.option_3, item.option_4],
      correctAnswer: item.answer - 1, // convert 1–4 to 0–3 for frontend
      explanation: item.explanation,
    }));

    res.status(200).json(formattedMcqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch MCQs", error });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
