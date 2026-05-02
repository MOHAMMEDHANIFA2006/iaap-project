require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");
const Marks = require("./models/Marks");
const Attendan;ce = require("./models/Attendance");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB");

    // Clear existing data
    await Student.deleteMany({});
    await Marks.deleteMany({});
    await Attendance.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Create students
    const students = [
      {
        name: "Mohammed Hanifa",
        department: "ECE",
        semester: 6,
        cgpa: 7.2
      },
      {
        name: "Priya Sharma",
        department: "CSE",
        semester: 6,
        cgpa: 8.5
      },
      {
        name: "Arun Kumar",
        department: "ECE",
        semester: 6,
        cgpa: 6.8
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log("✅ Created " + createdStudents.length + " students");

    // Create users with corresponding students
    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = [
      {
        email: "hanifa@example.com",
        password: hashedPassword,
        role: "student",
        studentId: createdStudents[0]._id
      },
      {
        email: "priya@example.com",
        password: hashedPassword,
        role: "student",
        studentId: createdStudents[1]._id
      },
      {
        email: "arun@example.com",
        password: hashedPassword,
        role: "student",
        studentId: createdStudents[2]._id
      },
      {
        email: "faculty1@example.com",
        password: hashedPassword,
        role: "faculty"
      },
      {
        email: "faculty2@example.com",
        password: hashedPassword,
        role: "faculty"
      },
      {
        email: "teacher1@example.com",
        password: hashedPassword,
        role: "teacher"
      },
      {
        email: "teacher2@example.com",
        password: hashedPassword,
        role: "teacher"
      },
      {
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin"
      }
    ];

    await User.insertMany(users);
    console.log("✅ Created " + users.length + " users");

    // Create marks for each student
    const subjects = [
      "Signals and Systems",
      "Analog Communication",
      "Digital Communication",
      "Microwave Engineering",
      "Electromagnetics"
    ];

    let marksCount = 0;
    for (const student of createdStudents) {
      const studentMarks = subjects.map(subject => ({
        studentId: student._id,
        subject: subject,
        internal: Math.floor(Math.random() * 40) + 10,
        external: Math.floor(Math.random() * 60) + 20
      }));
      await Marks.insertMany(studentMarks);
      marksCount += studentMarks.length;
    }
    console.log("✅ Created " + marksCount + " marks entries");

    // Create attendance records for each student
    let attendanceCount = 0;
    for (const student of createdStudents) {
      const studentAttendance = subjects.map(subject => ({
        studentId: student._id,
        subject: subject,
        attendancePercentage: Math.floor(Math.random() * 30) + 70
      }));
      await Attendance.insertMany(studentAttendance);
      attendanceCount += studentAttendance.length;
    }
    console.log("✅ Created " + attendanceCount + " attendance entries");

    console.log("\n📊 DATABASE SEEDING COMPLETE!");
    console.log("📝 Student Test Credentials:");
    console.log("   Email: hanifa@example.com");
    console.log("   Password: password123");
    console.log("   Email: priya@example.com");
    console.log("   Password: password123");
    console.log("   Email: arun@example.com");
    console.log("   Password: password123");
    console.log("\n👨‍🏫 Faculty Test Credentials:");
    console.log("   Email: faculty1@example.com");
    console.log("   Password: password123");
    console.log("   Email: faculty2@example.com");
    console.log("   Password: password123");
    console.log("\n🏫 Teacher Test Credentials:");
    console.log("   Email: teacher1@example.com");
    console.log("   Password: password123");
    console.log("   Email: teacher2@example.com");
    console.log("   Password: password123");
    console.log("\n👑 Admin Test Credentials:");
    console.log("   Email: admin@example.com");
    console.log("   Password: password123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();
