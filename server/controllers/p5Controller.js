const ProjectP5 = require("../models/ProjectP5");

// Buat Projek P5 Baru
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      theme,
      description,
      academicYear,
      level,
      facilitators,
      targets,
      startDate,
      endDate,
    } = req.body;

    const newProject = new ProjectP5({
      title,
      theme,
      description,
      academicYear,
      level,
      facilitators,
      targets,
      startDate,
      endDate,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat projek P5", error: error.message });
  }
};

// Ambil Projek P5 per Kelas/Level
exports.getProjects = async (req, res) => {
  try {
    const { level, academicYear } = req.query;
    const projects = await ProjectP5.find({ level, academicYear }).populate(
      "facilitators",
      "username profile.fullName"
    );
    res.json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data projek", error: error.message });
  }
};

// Penilaian P5 (Sementara di-handle via update project atau schema terpisah,
// ini contoh update simple untuk logic penilaian nanti bisa dikembangkan lebih detail per siswa)
// Catatan: Biasanya nilai P5 melekat ke Siswa, schema saat ini masih di ProjectP5.
// Kita asumsikan untuk penilaian siswa akan dibuat collection terpisah atau di-embed jika tidak banyak.
// Untuk MVP, kita lewati dulu detail penilaian per individu sampai ada request spesifik UI-nya.
