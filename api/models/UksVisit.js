const mongoose = require("mongoose");

const uksVisitSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Petugas UKS
    date: { type: Date, default: Date.now },

    complaint: { type: String, required: true }, // Keluhan: Pusing, Luka, dll
    diagnosis: String,
    treatment: String, // Tindakan: Istirahat, Obat, Rujuk RS
    medicineGiven: String,

    status: {
      type: String,
      enum: ["Istirahat", "Pulang", "Rujuk", "Sembuh"],
      default: "Istirahat",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UksVisit", uksVisitSchema);
