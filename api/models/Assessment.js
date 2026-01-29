const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classes: [{ type: String }], // Array of class names e.g. ["7A", "7B"]
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deadline: { type: Date },
    attachments: [{ type: String }], // URLs of uploaded files
    type: {
      type: String,
      enum: ["assignment", "material", "exam", "quiz", "project"],
      default: "assignment",
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    semester: { type: String, enum: ["Ganjil", "Genap"], required: true },
    learningGoals: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LearningGoal" },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", AssessmentSchema);
