const express = require("express");
const router = express.Router();
const studentAffairsController = require("../controllers/studentAffairsController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Incidents
router.post(
  "/incidents",
  auth,
  checkRole(["admin", "teacher"]),
  studentAffairsController.reportIncident
);
router.get(
  "/incidents",
  auth,
  checkRole(["admin", "teacher", "parent"]),
  studentAffairsController.getIncidents
);

// Achievements
router.post(
  "/achievements",
  auth,
  checkRole(["admin", "teacher"]),
  studentAffairsController.addAchievement
);
router.get("/achievements", auth, studentAffairsController.getAchievements);

// Update Incident Status
router.put(
  "/incidents/:id",
  auth,
  checkRole(["admin", "teacher"]),
  studentAffairsController.updateIncidentStatus
);

// Counseling
router.post(
  "/counseling",
  auth,
  checkRole(["admin", "teacher"]),
  studentAffairsController.addCounselingSession
);
router.get("/counseling", auth, studentAffairsController.getCounselingSessions);

// Stats & Alerts
router.get(
  "/stats/violations",
  auth,
  checkRole(["admin", "teacher"]),
  studentAffairsController.getViolationStats
);

module.exports = router;
