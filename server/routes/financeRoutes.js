const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Admin Keuangan
router.post(
  "/generate",
  auth,
  checkRole(["admin"]),
  financeController.generateMonthlyBilling
);
router.post("/pay", auth, checkRole(["admin"]), financeController.payBilling);
router.get(
  "/all",
  auth,
  checkRole(["admin"]),
  financeController.getAllBillings
);

// Siswa/Ortu
router.get("/my-billings", auth, financeController.getMyBillings);

module.exports = router;
