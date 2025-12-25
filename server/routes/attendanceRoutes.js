const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Input Absensi (Guru & Admin)
router.post(
  "/",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.recordBatchAttendance
);

// Get Daily Attendance (Untuk Form Input)
router.get(
  "/daily",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.getDailyAttendance
);

// Get Stat (Siswa bisa lihat sendiri, Guru/Admin lihat semua)
router.get("/stats/:studentId", auth, attendanceController.getStudentSummary);

module.exports = router;
