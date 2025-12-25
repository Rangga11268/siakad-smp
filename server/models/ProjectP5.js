const mongoose = require("mongoose");

const projectP5Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    theme: { type: String, required: true }, // e.g. "Gaya Hidup Berkelanjutan"
    description: String,

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    level: { type: Number, required: true }, // 7, 8, 9

    // Team Teaching: Multiple facilitators
    facilitators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Teachers

    // Dimensions and Elements targeted
    // Since Dimensions are static, we might just store strings/codes or create a separate MasterData schema for them.
    // For simplicity now, store structured objects.
    targets: [
      {
        dimension: String, // "Beriman, Bertakwa..."
        element: String, // "Akhlak kepada alam"
        subElement: String, // "Menjaga lingkungan..."
      },
    ],

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectP5", projectP5Schema);
