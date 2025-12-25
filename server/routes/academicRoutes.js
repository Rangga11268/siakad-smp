const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// TP Management (Hanya Guru & Admin)
router.post(
  "/subject",
  auth,
  checkRole(["admin"]),
  academicController.createSubject
);
router.get("/subject", auth, academicController.getSubjects);

router.post(
  "/class",
  auth,
  checkRole(["admin"]),
  academicController.createClass
);
router.get("/class", auth, academicController.getClasses);

// TP Management (Hanya Guru & Admin)
router.post(
  "/tp",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.createLearningGoal
);
router.get("/tp", auth, academicController.getLearningGoals);

// Grade Management
router.get(
  "/students/level/:level",
  auth,
  academicController.getStudentsByLevel
);

// Assessment Management
router.post(
  "/assessment",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.createAssessment
);

// Grade Management
router.post(
  "/grades",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.inputGrades
);
router.get(
  "/grades/:assessmentId",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.getClassGrades
);

// Report Generator
router.post(
  "/report/generate",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.generateReport
);

module.exports = router;
