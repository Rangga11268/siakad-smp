const mongoose = require("mongoose");

const projectLogbookSchema = new mongoose.Schema(
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
    title: {
      type: String, // e.g., "Refleksi Minggu 1", "Eksplorasi Isu"
      required: true,
    },
    content: {
      type: String, // Refleksi siswa: "Tantangan minggu ini...", "Kerjasama tim..."
      required: true,
    },
    media: [
      {
        type: String, // URL/Path to image/doc
      },
    ],
    feedback: {
      type: String, // Komentar guru
      default: "",
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProjectLogbook", projectLogbookSchema);
