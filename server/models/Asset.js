const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // QR Code value
    name: { type: String, required: true },
    category: { type: String }, // "Furniture", "Electronics", "Books"

    condition: {
      type: String,
      enum: ["Baik", "Rusak Ringan", "Rusak Berat"],
      default: "Baik",
    },

    location: { type: String, required: true }, // "Lab Komputer", "Kelas 7A"

    purchaseDate: Date,
    purchasePrice: Number,
    currentValue: Number, // For depreciation calculation

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Penanggung Jawab
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
