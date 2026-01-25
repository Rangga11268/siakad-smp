const LearningMaterial = require("../models/LearningMaterial");
const Subject = require("../models/Subject");
const AcademicYear = require("../models/AcademicYear");
const fs = require("fs");
const path = require("path");

// Upload Material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, type, description, subjectId, gradeLevel, academicYearId } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File wajib diupload" });
    }

    const fileUrl = `/uploads/materials/${req.file.filename}`;

    const newMaterial = new LearningMaterial({
      title,
      type,
      description,
      fileUrl,
      subject: subjectId,
      gradeLevel,
      teacher: req.user.id,
      academicYear: academicYearId,
    });

    await newMaterial.save();
    res
      .status(201)
      .json({ message: "Materi berhasil diupload", material: newMaterial });
  } catch (error) {
    if (req.file) {
      // Cleanup file if DB save fails
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: "Gagal upload materi", error: error.message });
  }
};

// Get Materials (Filterable)
exports.getMaterials = async (req, res) => {
  try {
    const { subjectId, gradeLevel, type } = req.query;
    const filter = {};
    if (subjectId) filter.subject = subjectId;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (type) filter.type = type;

    const materials = await LearningMaterial.find(filter)
      .populate("subject", "name")
      .populate("teacher", "profile.fullName")
      .sort("-createdAt");

    res.json(materials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data matri", error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Materi tidak ditemukan" });

    // Check ownership (only uploader or admin)
    if (
      material.teacher.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak ada akses" });
    }

    // Delete file
    const filePath = path.join(__dirname, "..", material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await material.deleteOne();
    res.json({ message: "Materi berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus materi", error: error.message });
  }
};
