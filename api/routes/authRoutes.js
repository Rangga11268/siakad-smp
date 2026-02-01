const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

router.post("/register", validate("register"), authController.register);
router.post("/login", validate("login"), authController.login);
router.get("/me", auth, authController.getMe);
router.put("/profile", auth, authController.updateMyProfile);

module.exports = router;
