const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "2025/2026"
    semester: { type: String, enum: ["Ganjil", "Genap"], required: true },
    status: {
      type: String,
      enum: ["active", "archived", "upcoming"],
      default: "upcoming",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Ensure unique combination of name and semester
academicYearSchema.index({ name: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
