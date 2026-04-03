const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Fetch full user to get studentId
    const user = await User.findById(decoded.id);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      studentId: user?.studentId
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
