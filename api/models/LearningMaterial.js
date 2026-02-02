const mongoose = require("mongoose");

const learningMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Materi", "Tugas", "Latihan", "Video", "Lainnya"],
      default: "Materi",
    },
    description: { type: String },

    // File-based content
    fileUrl: { type: String }, // Path to uploaded file (optional if using externalUrl)

    // External link content (YouTube, Google Drive, etc.)
    externalUrl: { type: String },

    // Source type to differentiate content type
    sourceType: {
      type: String,
      enum: ["file", "link", "youtube"],
      default: "file",
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    gradeLevel: {
      type: String,
      enum: ["7", "8", "9"], // Assuming SMP grades
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
    },

    // Optional: View count for analytics
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LearningMaterial", learningMaterialSchema);
