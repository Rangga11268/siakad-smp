const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Books
router.get("/books", auth, libraryController.getBooks);
router.post(
  "/books",
  auth,
  checkRole(["admin", "teacher"]),
  libraryController.addBook
);

// Loans
router.post(
  "/borrow",
  auth,
  checkRole(["admin", "teacher", "student"]), // Self-service borrowing
  libraryController.borrowBook
); // Admin borrows for student or student borrows? Context: Admin/Librarian usually scans.
router.post(
  "/return",
  auth,
  checkRole(["admin", "teacher"]),
  libraryController.returnBook
);

router.post(
  "/approve",
  auth,
  checkRole(["admin", "teacher"]),
  libraryController.approveLoan
);

router.post(
  "/reject",
  auth,
  checkRole(["admin", "teacher"]),
  libraryController.rejectLoan
);

router.get(
  "/loans",
  auth,
  checkRole(["admin", "teacher"]),
  libraryController.getAllLoans
);
router.get("/my-loans", auth, libraryController.getMyLoans);

module.exports = router;
