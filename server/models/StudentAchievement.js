const mongoose = require("mongoose");

const studentAchievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    title: { type: String, required: true }, // Juara 1 Lomba Pidato
    category: {
      type: String,
      enum: ["Akademik", "Non-Akademik"],
      default: "Non-Akademik",
    },
    level: {
      type: String,
      enum: [
        "Sekolah",
        "Kecamatan",
        "Kabupaten",
        "Provinsi",
        "Nasional",
        "Internasional",
      ],
      default: "Sekolah",
    },
    description: String,
    evidence: String, // Sertifikat URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentAchievement", studentAchievementSchema);
