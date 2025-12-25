const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "7A", "8B"
    level: { type: Number, required: true, enum: [7, 8, 9] },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Wali Kelas

    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Anggota Kelas

    // Location/Room info
    room: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
