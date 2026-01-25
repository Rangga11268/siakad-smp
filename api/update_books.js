require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for Seed Update");

    // Sample Data
    const books = await Book.find({});

    for (const book of books) {
      let updates = {};

      // Add random cover if missing
      if (!book.coverImage || book.coverImage === "") {
        // Using placeholder book covers
        updates.coverImage = `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400&h=600`;
        if (book.category === "Sains")
          updates.coverImage =
            "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400&h=600";
        if (book.category === "Sejarah")
          updates.coverImage =
            "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400&h=600";
      }

      // Add dummy PDF for some books
      if (!book.pdfUrl && Math.random() > 0.5) {
        updates.pdfUrl =
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        updates.synopsis =
          "Ini adalah buku digital yang bisa dibaca langsung melalui aplikasi. Nikmati kemudahan literasi di mana saja.";
      } else if (!book.synopsis) {
        updates.synopsis =
          "Buku cetak tersedia di perpustakaan. Silakan pinjam untuk membaca lebih lanjut mengenai topik menarik ini.";
      }

      if (Object.keys(updates).length > 0) {
        await Book.updateOne({ _id: book._id }, { $set: updates });
        console.log(`Updated book: ${book.title}`);
      }
    }

    console.log("Seed Update Completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
