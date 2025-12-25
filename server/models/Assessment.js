const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "Ulangan Harian 1"
    type: {
      type: String,
      enum: ["formative", "summative"],
      default: "formative",
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    semester: { type: String, enum: ["Ganjil", "Genap"], required: true },

    // Critical for Kurikulum Merdeka: Tag to TP
    learningGoals: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LearningGoal" },
    ],

    maxScore: { type: Number, default: 100 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
