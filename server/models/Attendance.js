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

    // Enhanced Attendance (Subject Based)
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }, // For linking to specific schedule slot
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student on same date AND same subject/schedule
// Note: Unique index might need adjustment. Complex unique constraint or handle in controller.
// For now, let's remove strict unique on date ONLY, or make compound index.
// attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
// Replaced with: check in controller.

module.exports = mongoose.model("Attendance", attendanceSchema);
