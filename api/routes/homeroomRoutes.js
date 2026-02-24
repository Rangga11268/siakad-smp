const express = require("express");
const router = express.Router();
const homeroomController = require("../controllers/homeroomController");
const { auth } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(auth);

// Dashboard
router.get("/dashboard", homeroomController.getHomeroomDashboard);

// Attendance Summary
router.get("/attendance", homeroomController.getClassAttendanceSummary);

// Grades Summary
router.get("/grades", homeroomController.getClassGradesSummary);

// Student Detail
router.get("/student/:studentId", homeroomController.getStudentDetail);

// Analytics
router.get("/analytics/trend", homeroomController.getStudentPerformanceTrend);
router.get("/analytics/heatmap", homeroomController.getSubjectHeatmap);

module.exports = router;
