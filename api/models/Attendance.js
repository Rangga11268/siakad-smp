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
  { timestamps: true },
);

// Compound unique index: prevent duplicate attendance for same student, date, and subject/schedule. This allows:. - Same student can have multiple attendance records per day (different subjects). - Same student cannot have duplicate attendance for same subject on same day
attendanceSchema.index(
  { student: 1, date: 1, schedule: 1 },
  {
    unique: true,
    sparse: true, // Allow documents without schedule field (for general daily attendance)
    partialFilterExpression: { schedule: { $exists: true } },
  },
);

// For daily attendance (without subject/schedule)
attendanceSchema.index(
  { student: 1, date: 1, subject: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      schedule: { $exists: false },
      subject: { $exists: true },
    },
  },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
