const mongoose = require("mongoose");

const projectP5Schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    theme: { type: String, required: true }, // e.g. "Gaya Hidup Berkelanjutan"
    description: String,

    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    level: { type: Number, required: true }, // 7, 8, 9

    // Team Teaching: Banyak fasilitator
    facilitators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Dimensi dan Elemen yang dinilai
    targets: [
      {
        dimension: String,
        element: String,
        subElement: String,
      },
    ],

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectP5", projectP5Schema);
