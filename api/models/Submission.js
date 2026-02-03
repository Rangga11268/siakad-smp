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
      enum: ["submitted", "graded", "late", "revision_requested"],
      default: "submitted",
    },

    // Rubric-based grading
    rubricScores: [
      {
        criteriaName: { type: String },
        score: { type: Number },
        maxScore: { type: Number },
        feedback: { type: String },
      },
    ],

    // Revision history
    revisionCount: { type: Number, default: 0 },
    revisions: [
      {
        text: { type: String },
        files: [{ type: String }],
        driveLink: { type: String },
        submittedAt: { type: Date },
        grade: { type: Number },
        feedback: { type: String },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", SubmissionSchema);
