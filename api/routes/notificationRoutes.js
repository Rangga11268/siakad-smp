const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { auth } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(auth);

// Get notifications
router.get("/", notificationController.getNotifications);

// Mark as read (single or all)
router.patch("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
