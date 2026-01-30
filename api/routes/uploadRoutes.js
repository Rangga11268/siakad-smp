const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { auth } = require("../middleware/authMiddleware");

// Ensure Directory Exists
const uploadDir = path.join(__dirname, "../uploads/p5");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "p5-" + uniqueSuffix + ext);
  },
});

// Upload Middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|zip|rar/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext.substring(1)))
      cb(null, true); // remove dot
    else
      cb(
        new Error(
          "Format file tidak didukung (Gunakan JPG, PNG, PDF, DOC, ZIP)",
        ),
      );
  },
});

const optimizeImage = require("../middleware/optimizeImage");

router.post("/", auth, upload.single("file"), optimizeImage, (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Return URL
    const fileUrl = `/uploads/p5/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

module.exports = router;
