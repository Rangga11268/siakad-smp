const express = require("express");
const router = express.Router();
const uksController = require("../controllers/uksController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Health Records
router.post(
  "/records",
  auth,
  checkRole(["admin", "teacher"]),
  uksController.addHealthRecord
);
router.get(
  "/records",
  auth,
  checkRole(["admin", "teacher", "parent", "student"]),
  uksController.getHealthRecords
);

// Visits
router.post(
  "/visits",
  auth,
  checkRole(["admin", "teacher"]),
  uksController.addVisit
);
router.get(
  "/visits",
  auth,
  checkRole(["admin", "teacher"]),
  uksController.getVisits
);

module.exports = router;
