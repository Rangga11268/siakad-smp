const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String }, // Text answer
    files: [{ type: String }], // File URLs
    driveLink: { type: String }, // Drive Link submission
    grade: { type: Number }, // 0-100
    feedback: { type: String }, // Teacher feedback
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["submitted", "graded", "late"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", SubmissionSchema);
