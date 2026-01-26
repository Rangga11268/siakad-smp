const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { auth } = require("../middleware/authMiddleware"); // Fixed: destructure auth
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup Multer for News Images
const uploadDir = path.join(__dirname, "../uploads/news");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, "news-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Hanya file gambar yang diperbolehkan!"));
  },
});

// Routes
router.get("/", newsController.getAllNews);
router.get("/:slug", newsController.getNewsBySlug);

// Admin Routes
router.post("/", auth, upload.single("thumbnail"), newsController.createNews);
router.put("/:id", auth, upload.single("thumbnail"), newsController.updateNews);
router.delete("/:id", auth, newsController.deleteNews);

module.exports = router;
