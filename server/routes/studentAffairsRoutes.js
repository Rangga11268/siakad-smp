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

module.exports = router;
