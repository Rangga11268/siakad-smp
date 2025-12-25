const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
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

    score: { type: Number, required: true },

    // Feedback specific to this student
    feedback: { type: String },

    // For 'rubric' type subjects, store the predicate or level
    predicate: { type: String }, // e.g., "Mahir", "Cakap"
  },
  { timestamps: true }
);

// Ensure one grade per student per assessment
gradeSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Grade", gradeSchema);
