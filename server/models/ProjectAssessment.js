const mongoose = require("mongoose");

const projectAssessmentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectP5",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilitator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who graded it

    // Scores per Dimension/Target defined in the Project
    scores: [
      {
        targetId: { type: String }, // Maps to targets._id in ProjectP5
        dimension: String,
        element: String,
        score: {
          type: String,
          enum: ["BB", "MB", "BSH", "SB"], // Belum/Mulai/Berkembang Sesuai/Sangat Berkembang
          required: true,
        },
        notes: String,
      },
    ],

    finalNotes: String, // Catatan Proses
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure one assessment per student per project
projectAssessmentSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ProjectAssessment", projectAssessmentSchema);
