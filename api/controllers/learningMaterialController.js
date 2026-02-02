const LearningMaterial = require("../models/LearningMaterial");
const Subject = require("../models/Subject");
const AcademicYear = require("../models/AcademicYear");
const fs = require("fs");
const path = require("path");

// Upload Material (File or External Link)
exports.uploadMaterial = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      subjectId,
      gradeLevel,
      academicYearId,
      externalUrl,
      sourceType,
    } = req.body;

    // Validate: either file or externalUrl is required
    if (!req.file && !externalUrl) {
      return res
        .status(400)
        .json({ message: "File atau Link eksternal wajib diisi" });
    }

    let fileUrl = null;
    let finalSourceType = sourceType || "file";

    if (req.file) {
      fileUrl = `/uploads/materials/${req.file.filename}`;
      finalSourceType = "file";
    } else if (externalUrl) {
      // Detect YouTube
      if (
        externalUrl.includes("youtube.com") ||
        externalUrl.includes("youtu.be")
      ) {
        finalSourceType = "youtube";
      } else {
        finalSourceType = "link";
      }
    }

    const newMaterial = new LearningMaterial({
      title,
      type: type || "Materi",
      description,
      fileUrl,
      externalUrl: externalUrl || null,
      sourceType: finalSourceType,
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
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: "Gagal upload materi", error: error.message });
  }
};

// Update Material
exports.updateMaterial = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      subjectId,
      gradeLevel,
      externalUrl,
      sourceType,
    } = req.body;

    const material = await LearningMaterial.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Materi tidak ditemukan" });

    // Check ownership
    if (
      material.teacher.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak ada akses" });
    }

    // Update fields
    if (title) material.title = title;
    if (type) material.type = type;
    if (description !== undefined) material.description = description;
    if (subjectId) material.subject = subjectId;
    if (gradeLevel) material.gradeLevel = gradeLevel;

    // Handle file update
    if (req.file) {
      // Delete old file if exists
      if (material.fileUrl) {
        const oldPath = path.join(__dirname, "..", material.fileUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      material.fileUrl = `/uploads/materials/${req.file.filename}`;
      material.sourceType = "file";
      material.externalUrl = null;
    } else if (externalUrl) {
      // Delete old file if switching to link
      if (material.fileUrl) {
        const oldPath = path.join(__dirname, "..", material.fileUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      material.fileUrl = null;
      material.externalUrl = externalUrl;
      material.sourceType =
        externalUrl.includes("youtube") || externalUrl.includes("youtu.be")
          ? "youtube"
          : "link";
    }

    await material.save();
    res.json({ message: "Materi berhasil diupdate", material });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update materi", error: error.message });
  }
};

// Get Materials (Filterable)
exports.getMaterials = async (req, res) => {
  try {
    const { subjectId, gradeLevel, type, teacherId, search } = req.query;
    const filter = {};

    if (subjectId) filter.subject = subjectId;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (type) filter.type = type;
    if (teacherId) filter.teacher = teacherId;
    if (search) filter.title = { $regex: search, $options: "i" };

    const materials = await LearningMaterial.find(filter)
      .populate("subject", "name")
      .populate("teacher", "profile.fullName")
      .sort("-createdAt");

    res.json(materials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data materi", error: error.message });
  }
};

// Get Material Stats (for dashboard cards)
exports.getMaterialStats = async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = teacherId ? { teacher: teacherId } : {};

    const stats = await LearningMaterial.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await LearningMaterial.countDocuments(filter);

    // Format stats
    const formatted = {
      total,
      Materi: 0,
      Tugas: 0,
      Latihan: 0,
      Video: 0,
      Lainnya: 0,
    };

    stats.forEach((s) => {
      if (formatted.hasOwnProperty(s._id)) {
        formatted[s._id] = s.count;
      }
    });

    res.json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil statistik", error: error.message });
  }
};

// Delete Material
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Materi tidak ditemukan" });

    // Check ownership
    if (
      material.teacher.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Tidak ada akses" });
    }

    // Delete file if exists
    if (material.fileUrl) {
      const filePath = path.join(__dirname, "..", material.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await material.deleteOne();
    res.json({ message: "Materi berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus materi", error: error.message });
  }
};
