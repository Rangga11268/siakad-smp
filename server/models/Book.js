const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // ISBN or Local Code
    title: { type: String, required: true },
    author: String,
    publisher: String,
    year: Number,

    category: String, // "Fiksi", "Pelajaran", "Sains"

    stock: { type: Number, default: 1 },
    available: { type: Number, default: 1 },

    location: String, // Rak A1
    coverImage: String, // URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
