const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, role, studentId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
      studentId
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      studentId: user.studentId
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
