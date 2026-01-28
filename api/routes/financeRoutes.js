const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/financeController");

// Public/Shared
router.get("/", auth, controller.getBills);

// Student
router.post(
  "/midtrans/token",
  auth,
  checkRole(["student", "parent"]),
  controller.createMidtransTransaction,
);
router.get(
  "/midtrans/status/:billId",
  auth,
  checkRole(["student", "parent"]),
  controller.checkMidtransStatus,
);
router.post(
  "/manual",
  auth,
  checkRole(["student", "parent"]),
  controller.uploadManualEvidence,
);

// Admin
router.post("/", auth, checkRole(["admin", "finance"]), controller.createBill);
router.put(
  "/confirm",
  auth,
  checkRole(["admin", "finance"]),
  controller.confirmPayment,
);

module.exports = router;
