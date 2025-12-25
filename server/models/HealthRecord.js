const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" },
    date: { type: Date, default: Date.now },

    // Anthropometry for Stunting Check
    height: Number, // cm
    weight: Number, // kg
    bmi: Number, // calculated backend/frontend
    headCircumference: Number, // cm (Lingkar Kepala)

    // Vision/Hearing
    visionLeft: String, // Normal, Minus, Plus
    visionRight: String,
    hearing: String, // Normal, Gangguan

    dentalHealth: String, // Karies, Sehat
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
