const express = require("express");
const router = express.Router();
const learningMaterialController = require("../controllers/learningMaterialController");
const { auth, checkRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Config
const uploadDir = "uploads/materials";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (for videos)
});

// Routes

// Stats (must be before /:id to avoid conflict)
router.get(
  "/stats",
  auth,
  checkRole(["teacher", "admin"]),
  learningMaterialController.getMaterialStats,
);

// Create
router.post(
  "/",
  auth,
  checkRole(["teacher", "admin"]),
  upload.single("file"),
  learningMaterialController.uploadMaterial,
);

// Read all
router.get("/", auth, learningMaterialController.getMaterials);

// Update
router.put(
  "/:id",
  auth,
  checkRole(["teacher", "admin"]),
  upload.single("file"),
  learningMaterialController.updateMaterial,
);

// Delete
router.delete(
  "/:id",
  auth,
  checkRole(["teacher", "admin"]),
  learningMaterialController.deleteMaterial,
);

module.exports = router;
