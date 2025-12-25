const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" },
    date: { type: Date, required: true }, // YYYY-MM-DD (Store as Date object)

    status: {
      type: String,
      enum: ["Present", "Sick", "Permission", "Alpha"], // Hadir, Sakit, Izin, Alpha
      default: "Present",
    },
    note: { type: String }, // Keterangan tambahan

    // Siapa yang menginput (Guru Mapel / Wali Kelas)
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student on same date
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
