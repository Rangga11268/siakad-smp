const express = require("express");
const router = express.Router();
const p5Controller = require("../controllers/p5Controller");
const { auth, checkRole } = require("../middleware/authMiddleware");

router.post(
  "/",
  auth,
  checkRole(["admin", "teacher"]),
  p5Controller.createProject
);
router.get("/", auth, p5Controller.getProjects);

// Assessment Routes
router.post(
  "/assess",
  auth,
  checkRole(["admin", "teacher"]),
  p5Controller.inputAssessment
);
router.get(
  "/assess/:projectId",
  auth,
  checkRole(["admin", "teacher"]),
  p5Controller.getProjectAssessments
);

router.get("/report/:projectId/:studentId", auth, p5Controller.getP5ReportData);

module.exports = router;
