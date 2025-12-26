const mongoose = require("mongoose");

const learningMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Materi", "Tugas", "Latihan", "Lainnya"],
      default: "Materi",
    },
    description: { type: String },
    fileUrl: { type: String, required: true }, // Path to uploaded file

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningMaterial", learningMaterialSchema);
