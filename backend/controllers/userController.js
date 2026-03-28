const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");

// Get all users filtered by role
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select("-password").populate("studentId");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("-password").populate("studentId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, department, semester } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // If role is student, create student record first
    let studentId = null;
    if (role === "student") {
      const student = new Student({
        name: firstName && lastName ? `${firstName} ${lastName}` : firstName || "New Student",
        department: department || "Unknown",
        semester: semester || 1,
        cgpa: 0
      });
      await student.save();
      studentId = student._id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      studentId
    });

    await user.save();

    const createdUser = await User.findById(user._id).select("-password").populate("studentId");
    res.status(201).json({
      message: "User created successfully",
      user: createdUser
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, firstName, lastName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      user.role = role;
    }

    // Update student name if provided
    if (user.studentId && (firstName || lastName)) {
      const student = await Student.findById(user.studentId);
      if (student) {
        if (firstName || lastName) {
          student.name = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || student.name;
          await student.save();
        }
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password").populate("studentId");
    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated student if exists
    if (user.studentId) {
      await Student.findByIdAndDelete(user.studentId);
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
};
