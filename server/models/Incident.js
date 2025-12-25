const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Guru piket/BK

    date: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ["Ringan", "Sedang", "Berat"],
      required: true,
    },
    description: { type: String, required: true },
    location: String,

    points: { type: Number, default: 0 }, // Poin pelanggaran

    // Workflow
    status: {
      type: String,
      enum: ["open", "investigating", "counseling", "resolved"],
      default: "open",
    },

    counselingNotes: { type: String }, // Confidential, restricted access
    actionTaken: String, // "Surat Panggilan Orang Tua", etc.

    attachment: String, // URL/Path to evidence image
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);
