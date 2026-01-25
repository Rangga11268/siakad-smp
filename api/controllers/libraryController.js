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
      pdfUrl,
      synopsis,
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
      pdfUrl,
      synopsis,
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
    // For Pending, we might want to reserve? But for now simple: decrement only on approve.
    // OPTIONAL: Reserve stock on Pending to avoid overbooking.
    // Let's decrement on Approve for simplicity, OR decrement now but restore on Reject.
    // DECISION: Decrement ONLY on Borrowed status to strictly reflect physical availability.
    if (status === "Borrowed") {
      book.available -= 1;
      await book.save();
    }

    res.status(201).json(loan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal pinjam buku", error: error.message });
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
    res.status(500).json({ message: "Gagal menyetujui", error: error.message });
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
    res.status(500).json({ message: "Gagal menolak", error: error.message });
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
