const express = require("express");
const router = express.Router();
const p5Controller = require("../controllers/p5Controller");
const { auth, checkRole } = require("../middleware/authMiddleware");

router.post(
  "/",
  auth,
  checkRole(["admin", "teacher"]),
  p5Controller.createProject
);
router.get("/", auth, p5Controller.getProjects);

module.exports = router;
