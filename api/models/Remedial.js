const mongoose = require("mongoose");

const remedialSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    originalScore: { type: Number, required: true },
    remedialScore: { type: Number, default: null },

    status: {
      type: String,
      enum: ["pending", "assigned", "completed"],
      default: "pending",
    },

    taskDescription: { type: String }, // Description of the remedial task assigned
    feedback: { type: String }, // Teacher feedback on remedial work
  },
  { timestamps: true },
);

// Ensure one remedial record per student per assessment
remedialSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Remedial", remedialSchema);
