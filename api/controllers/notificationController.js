const Notification = require("../models/Notification");
const User = require("../models/User");
const Class = require("../models/Class");

// Get User's Notifications
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === "true") query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat notifikasi", error: error.message });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === "all") {
      // Mark all as read
      await Notification.updateMany(
        { user: req.user.id, read: false },
        { read: true, readAt: new Date() },
      );
      res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
    } else {
      // Mark single notification
      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { read: true, readAt: new Date() },
        { new: true },
      );

      if (!notification) {
        return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
      }

      res.json(notification);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update notifikasi", error: error.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete({ _id: id, user: req.user.id });

    res.json({ message: "Notifikasi dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus notifikasi", error: error.message });
  }
};

// === HELPER FUNCTIONS (Internal use) ===

// Send notification to specific user
exports.sendToUser = async (
  userId,
  type,
  title,
  message,
  link = null,
  relatedId = null,
) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      link,
      relatedId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
};

// Send notification to all students in specific classes
exports.sendToClasses = async (
  classNames,
  type,
  title,
  message,
  link = null,
  relatedId = null,
) => {
  try {
    // Find all classes by name
    const classes = await Class.find({ name: { $in: classNames } }).populate(
      "students",
    );

    const studentIds = new Set();
    classes.forEach((cls) => {
      cls.students.forEach((student) => studentIds.add(student._id.toString()));
    });

    // Create notifications for all students
    const notifications = [];
    for (const studentId of studentIds) {
      notifications.push({
        user: studentId,
        type,
        title,
        message,
        link,
        relatedId,
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return notifications.length;
  } catch (error) {
    console.error("Failed to send class notifications:", error);
    return 0;
  }
};

// Send notification to all teachers
exports.sendToTeachers = async (
  type,
  title,
  message,
  link = null,
  relatedId = null,
) => {
  try {
    const teachers = await User.find({ role: "teacher", isActive: true });

    const notifications = teachers.map((teacher) => ({
      user: teacher._id,
      type,
      title,
      message,
      link,
      relatedId,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return notifications.length;
  } catch (error) {
    console.error("Failed to send teacher notifications:", error);
    return 0;
  }
};
