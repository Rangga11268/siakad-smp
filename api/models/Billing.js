const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true }, // e.g. "SPP Januari 2025"
    amount: { type: Number, required: true },

    type: {
      type: String,
      enum: ["SPP", "Gedung", "Seragam", "Lainnya"],
      default: "SPP",
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "cancelled"],
      default: "unpaid",
    },

    dueDate: Date,
    paidDate: Date,

    paymentMethod: String, // "Manual", "Transfer", "Midtrans"
    virtualAccount: String, // For integration
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);
