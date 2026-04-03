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

// 1. Body Parser
app.use(express.json({ limit: '10kb' }));

// 2. CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://your-frontend.vercel.app",
  credentials: true
};
app.use(cors(corsOptions));

// 3. Security Middleware
app.use(helmet());

// 4. Mongo Sanitize (Manual)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  // Skipped req.query to avoid "Cannot set property query" error in Express
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("API is running");
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
