const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { auth, checkRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Create Journal (Guru)
router.post(
  "/",
  auth,
  checkRole(["teacher", "admin"]),
  upload.single("attachment"),
  journalController.createJournal
);

// Get My Journals (Guru)
router.get(
  "/mine",
  auth,
  checkRole(["teacher", "admin"]),
  journalController.getMyJournals
);

// Get By ClassID
router.get("/class/:classId", auth, journalController.getJournalsByClass);

// Get All (Admin)
router.get("/", auth, checkRole(["admin"]), journalController.getAllJournals);

module.exports = router;
