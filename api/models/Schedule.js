const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
      required: true,
    },
    startTime: { type: String, required: true }, // Format HH:mm
    endTime: { type: String, required: true }, // Format HH:mm
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    semester: { type: String, enum: ["Ganjil", "Genap"], default: "Ganjil" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
