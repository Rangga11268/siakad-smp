const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Input Absensi (Guru & Admin)
router.post(
  "/",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.recordBatchAttendance,
);

// Get Daily Attendance (Untuk Form Input)
router.get(
  "/daily",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.getDailyAttendance,
);

// Bulk Daily Attendance (Wali Kelas)
router.post(
  "/daily/bulk",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.recordBatchAttendance,
);

// Get Stat (Siswa bisa lihat sendiri, Guru/Admin lihat semua)
router.get("/stats/:studentId", auth, attendanceController.getStudentSummary);

// Absen Mandiri (Siswa)
router.post(
  "/self",
  auth,
  checkRole(["student"]),
  attendanceController.recordSelfAttendance,
);

// Absen Mapel
router.post(
  "/subject",
  auth,
  // checkRole(["student", "teacher"]), // Both can trigger
  attendanceController.recordSubjectAttendance,
);

// Monitoring per Jadwal
router.get(
  "/schedule",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.getAttendanceBySchedule,
);

// QR Code System
router.get(
  "/qr-token",
  auth,
  checkRole(["student"]),
  attendanceController.getQRToken,
);

router.post(
  "/qr-scan",
  auth,
  checkRole(["admin", "teacher"]),
  attendanceController.scanQR,
);

module.exports = router;
