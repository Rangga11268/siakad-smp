const express = require("express");
const router = express.Router();
const bkController = require("../controllers/bkController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Laporan hanya oleh Guru/Admin
router.post(
  "/incident",
  auth,
  checkRole(["admin", "teacher"]),
  bkController.reportIncident
);

// View riwayat (Guru/Admin/Ortu punya hak akses tertentu, disini kita buka dulu)
router.get("/student/:studentId", auth, bkController.getStudentIncidents);

// Update status (Hanya BK/Admin)
router.patch(
  "/incident/:incidentId",
  auth,
  checkRole(["admin", "teacher"]),
  bkController.updateIncidentStatus
);

module.exports = router;
