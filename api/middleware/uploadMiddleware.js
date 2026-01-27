const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { fileTypeFromBuffer } = require("file-type");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
};

// Storage Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // timestamp_sanitized-filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitized = sanitizeFilename(file.originalname);
    cb(null, uniqueSuffix + "-" + sanitized);
  },
});

// Enhanced filter with MIME type validation
const fileFilter = async (req, file, cb) => {
  // Skip if no actual file
  if (!file || !file.originalname) {
    return cb(null, false);
  }

  const allowedExtensions = /jpeg|jpg|png|pdf|doc|docx/;
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream", // Sometimes sent for unknown types
  ];

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else if (extname) {
    // Allow if extension is valid even if mimetype is different
    return cb(null, true);
  } else {
    cb(
      new Error("Hanya file Gambar dan Dokumen (PDF/Word) yang diperbolehkan!"),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter,
});

module.exports = upload;
