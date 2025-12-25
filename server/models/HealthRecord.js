const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: { type: Date, default: Date.now },

    // Fisik
    height: Number, // cm
    weight: Number, // kg
    bmi: Number, // Auto-calculated logic in controller
    status: String, // "Normal", "Underweight", "Overweight", "Obese"

    // Keluhan / Sakit
    complaint: String, // "Pusing", "Demam"
    diagnosis: String,
    treatment: String, // "Obat Paracetamol", "Istirahat"

    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Petugas UKS
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
