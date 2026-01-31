const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { auth, checkRole } = require("../middleware/authMiddleware");

router.get("/stats", auth, dashboardController.getDashboardStats);
router.get(
  "/student-stats",
  auth,
  checkRole(["student"]),
  dashboardController.getStudentDashboardStats,
);
router.get(
  "/teacher-stats",
  auth,
  checkRole(["teacher", "admin"]),
  dashboardController.getTeacherDashboardStats,
);

module.exports = router;
