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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Routes
router.post(
  "/",
  auth,
  checkRole(["teacher", "admin"]),
  upload.single("file"),
  learningMaterialController.uploadMaterial
);
router.get("/", auth, learningMaterialController.getMaterials); // Available to all (Student, Teacher, Admin)
router.delete(
  "/:id",
  auth,
  checkRole(["teacher", "admin"]),
  learningMaterialController.deleteMaterial
);

module.exports = router;
