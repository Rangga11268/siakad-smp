const mongoose = require("mongoose");

const teachingJournalSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    date: { type: Date, required: true },
    startTime: { type: String }, // e.g. "07:00"
    endTime: { type: String }, // e.g. "08:20"

    topic: { type: String, required: true }, // Materi Pembelajaran
    method: { type: String }, // Metode (Ceramah, Diskusi, Praktikum)
    studentActivity: { type: String }, // Kegiatan Siswa

    notes: { type: String }, // Catatan kejadian khusus / kendala

    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    materials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningMaterial",
      },
    ],
    attachments: [{ type: String }], // Direct simple uploads if any
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeachingJournal", teachingJournalSchema);
