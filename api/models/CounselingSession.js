const mongoose = require("mongoose");

const counselingSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["Pribadi", "Sosial", "Belajar", "Karir"],
      required: true,
    },
    title: { type: String, required: true }, // Topik Konseling
    notes: { type: String, required: true }, // Isi Konseling (Rahasia)
    followUp: String, // Tindak Lanjut
    isConfidential: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CounselingSession", counselingSessionSchema);
