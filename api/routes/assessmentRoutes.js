const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/assessmentController");

// Public (Authenticated)
router.get("/", auth, controller.getAssessments);
router.get("/:id", auth, controller.getAssessmentById);

// Student
router.post(
  "/:id/submit",
  auth,
  checkRole(["student"]),
  controller.submitAssignment,
);

// Teacher/Admin
router.post(
  "/",
  auth,
  checkRole(["teacher", "admin"]),
  controller.createAssessment,
);
router.get(
  "/:id/submissions",
  auth,
  checkRole(["teacher", "admin"]),
  controller.getSubmissionsByAssessment,
);
router.put(
  "/submission/:id",
  auth,
  checkRole(["teacher", "admin"]),
  controller.gradeSubmission,
);

module.exports = router;
