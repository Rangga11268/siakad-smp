const Book = require("../models/Book");
const Loan = require("../models/Loan");

const handleError = (res, error, defaultMessage) => {
  console.error(`❌ ${defaultMessage}:`, error);

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      message: `Validasi Gagal: ${details.join(", ")}`,
      error: details.join(", "),
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      message: "Data Duplikat: ISBN atau Judul sudah ada.",
      error: "Duplicate Key Error",
    });
  }

  // FORCE SHOW ERROR IN UI
  res.status(500).json({
    message: `${defaultMessage}: ${error.message}`,
    error: error.message,
  });
};

// --- Books / Katalog ---

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    handleError(res, error, "Gagal ambil data buku");
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
      pdfUrl,
      synopsis,
    } = req.body;

    // Basic Validation manually (if needed, but Mongoose does it)
    if (!title || !author || !category) {
      return res
        .status(400)
        .json({ message: "Judul, Penulis, dan Kategori wajib diisi!" });
    }

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
      pdfUrl,
      synopsis,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    handleError(res, error, "Gagal tambah buku");
  }
};

// Update Book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate if book exists
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    // Handle stock update: Adjust available count based on difference
    if (updates.stock !== undefined) {
      const stockDiff = parseInt(updates.stock) - book.stock;
      book.stock = parseInt(updates.stock);
      book.available += stockDiff;
      if (book.available < 0) book.available = 0; // Prevent negative
    }

    // Update other fields
    Object.keys(updates).forEach((key) => {
      if (key !== "stock" && key !== "available" && key !== "_id") {
        book[key] = updates[key];
      }
    });

    await book.save();
    res.json(book);
  } catch (error) {
    handleError(res, error, "Gagal update buku");
  }
};

// Delete Book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    // Check if there are active loans
    const activeLoans = await Loan.countDocuments({
      book: id,
      status: { $in: ["Borrowed", "Pending"] },
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: "Tidak dapat menghapus buku yang sedang dipinjam.",
        error: "Active loans exist",
      });
    }

    await Book.deleteOne({ _id: id });
    res.json({ message: "Buku berhasil dihapus" });
  } catch (error) {
    handleError(res, error, "Gagal hapus buku");
  }
};

// --- Circulation / Peminjaman ---

exports.borrowBook = async (req, res) => {
  try {
    const { studentId, bookId } = req.body;
    const isStudent = req.user.role === "student";

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
    if (book.available < 1)
      return res.status(400).json({ message: "Stok buku habis" });

    // Check active loan
    // Allow multiple requests? Maybe limit Pending + Borrowed
    const activeLoan = await Loan.findOne({
      student: isStudent ? req.user.id : studentId,
      book: bookId,
      status: { $in: ["Borrowed", "Pending"] },
    });

    if (activeLoan) {
      return res
        .status(400)
        .json({ message: "Anda sudah meminjam atau mengajukan buku ini." });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 days loan

    // Logic: Student -> Pending, Admin -> Borrowed
    const status = isStudent ? "Pending" : "Borrowed";

    const loan = new Loan({
      student: isStudent ? req.user.id : studentId,
      book: bookId,
      dueDate,
      status,
    });

    await loan.save();

    // Only decrement available stock if directly borrowed (Admin)
    const BookModel = require("../models/Book"); // Re-require to be safe or use 'book' doc
    if (status === "Borrowed") {
      book.available -= 1;
      await book.save();
    }

    res.status(201).json(loan);
  } catch (error) {
    handleError(res, error, "Gagal pinjam buku");
  }
};

exports.approveLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan)
      return res.status(404).json({ message: "Peminjaman tidak ditemukan" });
    if (loan.status !== "Pending")
      return res.status(400).json({ message: "Status bukan Pending" });

    const book = await Book.findById(loan.book);
    if (book.available < 1)
      return res
        .status(400)
        .json({ message: "Stok buku habis, tidak bisa setujui." });

    loan.status = "Borrowed";
    loan.borrowDate = new Date(); // Reset borrow date to approval time
    // Recalculate due date?
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    loan.dueDate = dueDate;

    await loan.save();

    book.available -= 1;
    await book.save();

    res.json(loan);
  } catch (error) {
    handleError(res, error, "Gagal menyetujui");
  }
};

exports.rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan)
      return res.status(404).json({ message: "Peminjaman tidak ditemukan" });

    loan.status = "Rejected";
    await loan.save();

    res.json(loan);
  } catch (error) {
    handleError(res, error, "Gagal menolak");
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
    loan.status = "Returned"; // Always set to Returned

    // Calculate fine if overdue
    if (loan.returnDate > loan.dueDate) {
      const diffTime = Math.abs(loan.returnDate - loan.dueDate);
      const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      loan.isOverdue = true;
      loan.fine = daysLate * 1000; // Rp 1.000 per day late
    }

    await loan.save();

    // Restore stock
    const book = await Book.findById(loan.book);
    if (book) {
      book.available += 1;
      await book.save();
    }

    res.json({
      message: loan.isOverdue
        ? `Buku dikembalikan terlambat. Denda: Rp ${loan.fine?.toLocaleString()}`
        : "Buku berhasil dikembalikan",
      loan,
    });
  } catch (error) {
    handleError(res, error, "Gagal kembalikan buku");
  }
};

exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ student: req.user.id })
      .populate("book", "title author")
      .sort({ borrowDate: -1 });
    res.json(loans);
  } catch (error) {
    handleError(res, error, "Gagal ambil data peminjaman");
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
    handleError(res, error, "Gagal ambil data peminjaman");
  }
};
