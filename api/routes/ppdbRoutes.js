const express = require("express");
const router = express.Router();
const ppdbController = require("../controllers/ppdbController");
const { auth, checkRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/ppdb");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error("Hanya file JPG, PNG, atau PDF yang diperbolehkan!"));
  },
});

router.post(
  "/register",
  upload.fields([
    { name: "docKK", maxCount: 1 },
    { name: "docAkta", maxCount: 1 },
    { name: "docRapor", maxCount: 1 },
  ]),
  validate("ppdbRegistration"),
  ppdbController.register,
);

router.get("/status/:nisn", ppdbController.checkStatus);

router.get(
  "/registrants",
  auth,
  checkRole(["admin"]),
  ppdbController.getAllRegistrants,
);

router.put(
  "/registrants/:id",
  auth,
  checkRole(["admin"]),
  ppdbController.updateStatus,
);

module.exports = router;
