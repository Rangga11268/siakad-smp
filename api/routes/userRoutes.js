const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth, checkRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");

// PUT /:id - Edit User (Admin only)
router.put(
  "/:id",
  auth,
  checkRole(["admin"]),
  validate("updateUser"),
  authController.updateUser,
);

// DELETE /:id - Delete User (Admin only)
router.delete("/:id", auth, checkRole(["admin"]), authController.deleteUser);

module.exports = router;
