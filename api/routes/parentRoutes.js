const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// All routes require authentication and 'parent' role
router.use(auth, checkRole(["parent"]));

// Dashboard overview (all children)
router.get("/dashboard", parentController.getParentDashboard);

// Specific child detail (grades, attendance)
router.get("/child/:childId", parentController.getChildDetail);

module.exports = router;
