const mongoose = require("mongoose");

const prospectiveStudentSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    nisn: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["L", "P"], required: true },
    birthPlace: { type: String, required: true },
    birthDate: { type: Date, required: true },
    address: { type: String, required: true },
    latitude: { type: Number }, // For Zonasi
    longitude: { type: Number }, // For Zonasi

    originSchool: { type: String, required: true },

    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },

    // Documents (URLs)
    docKK: { type: String },
    docAkta: { type: String },
    docRapor: { type: String },

    registrationPath: {
      type: String,
      enum: ["Zonasi", "Prestasi", "Afirmasi", "Pindah Tugas"],
      default: "Zonasi",
    },

    status: {
      type: String,
      enum: ["pending", "verified", "accepted", "rejected"],
      default: "pending",
    },

    notes: String, // Admin notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProspectiveStudent", prospectiveStudentSchema);
