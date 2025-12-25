const Book = require("../models/Book");
const Loan = require("../models/Loan");

// --- Books / Katalog ---

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data buku", error: error.message });
  }
};

exports.addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      publisher,
      isbn,
      year,
      category,
      stock,
      location,
      coverImage,
    } = req.body;

    const newBook = new Book({
      title,
      author,
      publisher,
      isbn,
      year,
      category,
      stock,
      available: stock, // Initially available
      location,
      coverImage,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal tambah buku", error: error.message });
  }
};

// --- Circulation / Peminjaman ---

exports.borrowBook = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
    if (book.available < 1)
      return res.status(400).json({ message: "Stok buku habis" });

    // Check active loan
    const activeLoan = await Loan.findOne({
      student: studentId,
      status: "Borrowed",
    });
    // Optional: Limit max borrowings per student

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days loan

    const loan = new Loan({
      student: studentId,
      book: bookId,
      dueDate,
    });

    await loan.save();

    // Update book stock
    book.available -= 1;
    await book.save();

    res.status(201).json(loan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal pinjam buku", error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { loanId } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan)
      return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    if (loan.status === "Returned")
      return res.status(400).json({ message: "Buku sudah dikembalikan" });

    loan.returnDate = new Date();
    loan.status = "Returned";

    // Calculate fine (Logic simplified)
    if (loan.returnDate > loan.dueDate) {
      loan.status = "Overdue"; // Or keep returned but flag fine
      // Calculate days late * fine per day
    }

    await loan.save();

    // Restore stock
    const book = await Book.findById(loan.book);
    if (book) {
      book.available += 1;
      await book.save();
    }

    res.json({ message: "Buku berhasil dikembalikan", loan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal kembalikan buku", error: error.message });
  }
};

exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ student: req.user.id })
      .populate("book", "title author")
      .sort({ borrowDate: -1 });
    res.json(loans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data peminjaman", error: error.message });
  }
};

// Admin view all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("student", "username profile.fullName")
      .populate("book", "title author")
      .sort({ borrowDate: -1 });
    res.json(loans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data peminjaman", error: error.message });
  }
};
