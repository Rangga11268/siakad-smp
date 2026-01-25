const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.post("/register", authController.register);
router.post("/login", validate("login"), authController.login);
router.get("/me", auth, authController.getMe);

module.exports = router;
