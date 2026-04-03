require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://your-frontend.vercel.app",
  credentials: true
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size for security

app.get("/", (req, res) => {
  res.send("Academic Analytics Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    success: false
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
