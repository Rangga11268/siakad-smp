const express = require("express");
const router = express.Router();
const ppdbController = require("../controllers/ppdbController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", ppdbController.register);
router.get("/status/:nisn", ppdbController.checkStatus);

// Admin Routes
router.get(
  "/registrants",
  auth,
  checkRole(["admin"]),
  ppdbController.getAllRegistrants
);
router.put(
  "/registrants/:id",
  auth,
  checkRole(["admin"]),
  ppdbController.updateStatus
);

module.exports = router;
