const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. "MAT-7"
    name: { type: String, required: true }, // e.g. "Matematika"
    level: { type: Number, required: true }, // 7, 8, or 9

    // KKM / Kriteria Ketuntasan
    kktpType: {
      type: String,
      enum: ["interval", "rubric", "description"],
      default: "interval",
    },

    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
