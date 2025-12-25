const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/siakad_smp")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const authRoutes = require("./routes/authRoutes");
const academicRoutes = require("./routes/academicRoutes");
const p5Routes = require("./routes/p5Routes");
const studentAffairsRoutes = require("./routes/studentAffairsRoutes");
const assetRoutes = require("./routes/assetRoutes");
const financeRoutes = require("./routes/financeRoutes");
const uksRoutes = require("./routes/uksRoutes");
const libraryRoutes = require("./routes/libraryRoutes");

// Routes
app.use("/api/auth", authRoutes);
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
app.get("/", (req, res) => {
  res.send({ message: "Welcome to SIAKAD SMP API" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start Cron Jobs
  require("./cron/billingScheduler").startBillingScheduler();
});
