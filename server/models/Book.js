const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    publisher: String,
    isbn: { type: String, unique: true, sparse: true }, // ISBN might not exist for some books
    year: Number,
    category: { type: String, required: true }, // e.g., Fiksi, Sains, Sejarah

    stock: { type: Number, required: true, default: 0 },
    available: { type: Number, required: true, default: 0 }, // Stock - Borrowed

    location: String, // Rak A1, Lemari B
    coverImage: String, // URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
