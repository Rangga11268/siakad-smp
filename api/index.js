const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Validate environment variables on startup
require("./config/validateEnv");

// Import logger
const logger = require("./config/logger");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for dev
  message: {
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// Use morgan with winston for HTTP logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection with logger
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/siakad_smp")
  .then(() => logger.info("✅ MongoDB Connected"))
  .catch((err) => logger.error("❌ MongoDB Connection Error:", err));

const authRoutes = require("./routes/authRoutes");
const academicRoutes = require("./routes/academicRoutes");
const p5Routes = require("./routes/p5Routes");
const studentAffairsRoutes = require("./routes/studentAffairsRoutes");
const assetRoutes = require("./routes/assetRoutes");
const financeRoutes = require("./routes/financeRoutes");
const uksRoutes = require("./routes/uksRoutes");
const libraryRoutes = require("./routes/libraryRoutes");

// Routes
app.use("/api/auth", authLimiter, authRoutes); // Apply rate limiter to auth routes
app.use("/api/users", require("./routes/userRoutes")); // Mount User Routes
app.use("/api/academic", academicRoutes);
app.use("/api/p5", p5Routes);
app.use("/api/bk", studentAffairsRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/uks", uksRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/ppdb", require("./routes/ppdbRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/schedule", require("./routes/scheduleRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/learning-material", require("./routes/learningMaterialRoutes"));
app.get("/", (req, res) => {
  res.send({ message: "Welcome to SIAKAD SMP API" });
});

// Start Server with logger
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);

  // Start Cron Jobs
  require("./cron/billingScheduler").startBillingScheduler();
});
