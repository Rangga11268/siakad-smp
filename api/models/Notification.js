const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "assignment_new",
        "deadline_reminder",
        "grade_published",
        "submission_received",
        "announcement",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String },
    link: { type: String }, // URL to navigate to
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // Related document ID
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true },
);

// Index for efficient querying
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
