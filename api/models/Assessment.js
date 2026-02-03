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

    // Status & Scheduling
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "closed"],
      default: "published", // Default for backward compatibility
    },
    publishAt: { type: Date }, // For scheduled publishing
    closedAt: { type: Date }, // When assignment closes (different from deadline)

    // Tags & Metadata
    tags: [{ type: String }], // Custom tags like "UTS", "Remedial"
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    estimatedDuration: { type: Number }, // In minutes

    // Revision settings
    allowRevision: { type: Boolean, default: false },
    maxRevisions: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", AssessmentSchema);
