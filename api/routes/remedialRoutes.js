const express = require("express");
const router = express.Router();
const remedialController = require("../controllers/remedialController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// All routes require teacher role for now
router.use(auth, checkRole(["teacher", "admin"]));

// Get list of students eligible for remedial (Below KKM)
router.get("/eligible", remedialController.getEligibleStudents);

// Assign remedial to a student
router.post("/assign", remedialController.assignRemedial);

// Submit remedial score and update status
router.put("/:id/score", remedialController.submitRemedialScore);

module.exports = router;
