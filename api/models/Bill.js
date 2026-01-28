const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true }, // e.g. "SPP Maret 2025"
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "waiting_verification"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["manual", "online"],
      default: "manual",
    },
    // Midtrans Data
    midtransOrderId: { type: String },
    midtransToken: { type: String },
    midtransStatus: { type: String }, // raw status from midtrans

    // Manual Data
    evidence: { type: String }, // Bukti transfer URL

    paidAt: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bill", BillSchema);
