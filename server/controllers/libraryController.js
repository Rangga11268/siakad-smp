const Book = require("../models/Book");
const Loan = require("../models/Loan");

// Tambah Buku
exports.addBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal tambah buku", error: error.message });
  }
};

// Cari Buku
exports.getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { title: { $regex: search, $options: "i" } };
    }
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Gagal cari buku", error: error.message });
  }
};

// Pinjam Buku
exports.borrowBook = async (req, res) => {
  try {
    const { studentId, bookId, days = 7 } = req.body;

    // Cek stok
    const book = await Book.findById(bookId);
    if (book.available < 1)
      return res.status(400).json({ message: "Stok buku habis" });

    // Hitung tanggal kembali
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const loan = new Loan({
      book: bookId,
      student: studentId,
      dueDate,
    });

    await loan.save();

    // Kurangi stok
    book.available -= 1;
    await book.save();

    res.status(201).json(loan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal pinjam buku", error: error.message });
  }
};

// Kembalikan Buku
exports.returnBook = async (req, res) => {
  try {
    const { loanId } = req.body;

    const loan = await Loan.findById(loanId).populate("book");
    if (!loan)
      return res
        .status(404)
        .json({ message: "Data peminjaman tidak ditemukan" });
    if (loan.status === "returned")
      return res.status(400).json({ message: "Buku sudah dikembalikan" });

    loan.status = "returned";
    loan.returnDate = new Date();

    // Cek denda (jika telat)
    if (loan.returnDate > loan.dueDate) {
      // Simple logic denda: 1000 per hari
      const diffTime = Math.abs(loan.returnDate - loan.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      loan.fine = diffDays * 1000;
    }

    await loan.save();

    // Tambah stok
    const book = await Book.findById(loan.book._id);
    book.available += 1;
    await book.save();

    res.json({ message: "Buku dikembalikan", fine: loan.fine });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal kembalikan buku", error: error.message });
  }
};
