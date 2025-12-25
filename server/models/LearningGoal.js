const mongoose = require("mongoose");

const learningGoalSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    level: { type: Number, required: true },

    code: { type: String, required: true }, // e.g., "TP.1.1"
    description: { type: String, required: true }, // The actual goal text

    semester: { type: String, enum: ["Ganjil", "Genap"], required: true },

    // Link to Capaian Pembelajaran (CP) - Optional text ref for now
    cpReference: { type: String },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningGoal", learningGoalSchema);
