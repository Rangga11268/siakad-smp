const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Create (Admin only)
router.post("/", auth, checkRole(["admin"]), scheduleController.createSchedule);

// Get (Public for auth users)
router.get("/", auth, scheduleController.getSchedules);

// Delete (Admin only)
router.delete(
  "/:id",
  auth,
  checkRole(["admin"]),
  scheduleController.deleteSchedule
);

module.exports = router;
