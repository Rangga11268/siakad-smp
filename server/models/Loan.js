const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true }, // Usually +7 days
    returnDate: Date,

    status: {
      type: String,
      enum: ["Borrowed", "Returned", "Overdue", "Lost"],
      default: "Borrowed",
    },

    fine: { type: Number, default: 0 }, // Denda keterlambatan
    finePaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
