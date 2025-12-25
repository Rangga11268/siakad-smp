const express = require("express");
const router = express.Router();
const libraryController = require("../controllers/libraryController");
const { auth, checkRole } = require("../middleware/authMiddleware");

// Buku (Admin/Pustakawan)
router.post("/books", auth, checkRole(["admin"]), libraryController.addBook);
router.get("/books", auth, libraryController.getBooks);

// Sirkulasi
router.post(
  "/borrow",
  auth,
  checkRole(["admin"]),
  libraryController.borrowBook
);
router.post(
  "/return",
  auth,
  checkRole(["admin"]),
  libraryController.returnBook
);

module.exports = router;
