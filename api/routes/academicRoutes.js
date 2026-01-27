const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const { auth, checkRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// TP Management (Hanya Guru & Admin)
router.post(
  "/subject",
  auth,
  checkRole(["admin"]),
  validate("createSubject"), // Add validation
  academicController.createSubject,
);
// Report
router.post("/report/generate", auth, academicController.generateReport);
router.get("/report/full", auth, academicController.generateFullReport);

router.get("/subjects", auth, academicController.getSubjects);
router.get("/teachers", auth, academicController.getTeachers);

// Academic Year
router.post(
  "/years",
  auth,
  checkRole(["admin"]),
  academicController.createAcademicYear,
);
router.get("/years", auth, academicController.getAcademicYears);

// Master Siswa
router.post(
  "/students",
  auth,
  checkRole(["admin"]),
  validate("createStudent"),
  academicController.createStudent,
);
router.get(
  "/students",
  auth,
  checkRole(["admin", "teacher"]),
  academicController.getAllStudents,
);

router.get(
  "/students/:id",
  auth,
  checkRole(["admin", "teacher"]),
  academicController.getStudentById,
);

router.put(
  "/students/:id",
  auth,
  checkRole(["admin"]),
  academicController.updateStudent,
);

router.post(
  "/class",
  auth,
  checkRole(["admin"]),
  validate("createClass"), // Add validation
  academicController.createClass,
);
router.get("/class", auth, academicController.getClasses);
router.put(
  "/class/:id",
  auth,
  checkRole(["admin"]),
  validate("createClass"), // Validate updates too
  academicController.updateClass,
);

// Class Members
router.get(
  "/class/:classId/students",
  auth,
  academicController.getClassMembers,
);
router.post(
  "/class/:classId/students",
  auth,
  checkRole(["admin"]),
  academicController.addStudentToClass,
);
router.delete(
  "/class/:classId/students",
  auth,
  checkRole(["admin"]),
  academicController.removeStudentFromClass,
);

// TP Management (Hanya Guru & Admin)
router.post(
  "/tp",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.createLearningGoal,
);
router.get("/tp", auth, academicController.getLearningGoals);

// Grade Management
router.get(
  "/students/level/:level",
  auth,
  academicController.getStudentsByLevel,
);

// Assessment Management
router.post(
  "/assessment",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.createAssessment,
);

// Grade Management
router.post(
  "/grades",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.inputGrades,
);
router.get(
  "/grades/:assessmentId",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.getClassGrades,
);

// Report Generator
router.post(
  "/report/generate",
  auth,
  checkRole(["teacher", "admin"]),
  academicController.generateReport,
);

// Student Grades
router.get(
  "/my-grades",
  auth,
  checkRole(["student"]),
  academicController.getMyGrades,
);

module.exports = router;
