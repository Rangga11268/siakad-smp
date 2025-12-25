const express = require("express");
const router = express.Router();
const uksController = require("../controllers/uksController");
const { auth, checkRole } = require("../middleware/authMiddleware");

router.post(
  "/record",
  auth,
  checkRole(["admin", "teacher"]),
  uksController.createRecord
);
router.get("/student/:studentId", auth, uksController.getStudentRecords);

module.exports = router;
