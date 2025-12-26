const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
const { auth } = require("../middleware/authMiddleware");
router.get("/me", auth, authController.getMe);

module.exports = router;
