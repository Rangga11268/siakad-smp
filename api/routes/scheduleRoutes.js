const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Create (Admin & Teacher)
router.post(
  "/",
  auth,
  checkRole(["admin", "teacher"]),
  scheduleController.createSchedule,
);

// Get (Public for auth users)
router.get("/", auth, scheduleController.getSchedules);

// Delete (Admin & Teacher)
router.delete(
  "/:id",
  auth,
  checkRole(["admin", "teacher"]),
  scheduleController.deleteSchedule,
);

module.exports = router;
