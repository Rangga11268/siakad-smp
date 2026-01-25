const mongoose = require("mongoose");

const studentIncidentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Guru/Staff pelapor
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      required: true,
      enum: [
        "Keterlambatan",
        "Atribut",
        "Bolos",
        "Bullying",
        "Merokok",
        "Berkelahi",
        "Lainnya",
      ],
    },
    description: { type: String, required: true },
    point: { type: Number, required: true, default: 0 }, // Poin pelanggaran (positif = menambah dosa/poin buruk)
    sanction: String, // Hukuman yang diberikan
    evidence: String, // URL bukti foto/dokumen
    status: {
      type: String,
      enum: ["Open", "FollowUp", "Resolved"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentIncident", studentIncidentSchema);
