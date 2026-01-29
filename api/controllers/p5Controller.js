const ProjectP5 = require("../models/ProjectP5");
const logger = require("../config/logger");

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

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (level) query.level = level;

    logger.debug("Fetching P5 Projects with query:", query);

    const projects = await ProjectP5.find(query).populate(
      "facilitators",
      "username profile.fullName",
    );
    res.json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data projek", error: error.message });
  }
};

// Update Projek
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updated = await ProjectP5.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Projek tidak ditemukan" });
    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update projek", error: error.message });
  }
};

// Hapus Projek
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deleted = await ProjectP5.findByIdAndDelete(projectId);
    if (!deleted)
      return res.status(404).json({ message: "Projek tidak ditemukan" });
    res.json({ message: "Projek berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus projek", error: error.message });
  }
};

// Penilaian P5
const ProjectAssessment = require("../models/ProjectAssessment");

exports.inputAssessment = async (req, res) => {
  try {
    const { projectId, studentId, scores, finalNotes, facilitatorId } =
      req.body;

    const assessment = await ProjectAssessment.findOneAndUpdate(
      { project: projectId, student: studentId },
      {
        facilitator: facilitatorId || req.user.id,
        scores,
        finalNotes,
      },
      { new: true, upsert: true }, // Create if not exists
    );

    res.json(assessment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal simpan penilaian P5", error: error.message });
  }
};

exports.getProjectAssessments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const assessments = await ProjectAssessment.find({
      project: projectId,
    }).populate("student", "username profile.fullName profile.nisn");
    res.json(assessments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil penilaian P5", error: error.message });
  }
};

// Ambil Data Rapor P5 (Project + Nilai Siswa)
exports.getP5ReportData = async (req, res) => {
  try {
    const { projectId, studentId } = req.params;

    // 1. Get Project Details
    const project = await ProjectP5.findById(projectId).populate(
      "facilitators",
      "username profile.fullName",
    );
    if (!project)
      return res.status(404).json({ message: "Projek tidak ditemukan" });

    // 2. Get Student Profile
    const User = require("../models/User");
    const student = await User.findById(studentId).select("username profile");
    if (!student)
      return res.status(404).json({ message: "Siswa tidak ditemukan" });

    // 3. Get Assessment
    const assessment = await ProjectAssessment.findOne({
      project: projectId,
      student: studentId,
    });

    res.json({
      project,
      student,
      assessment: assessment || { scores: [], finalNotes: "" },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data rapor P5", error: error.message });
  }
};

// Logbook P5
const ProjectLogbook = require("../models/ProjectLogbook");

exports.createLogbook = async (req, res) => {
  try {
    const { project, title, content, media } = req.body;
    const newLog = new ProjectLogbook({
      project,
      student: req.user.id,
      title,
      content,
      media,
    });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal simpan logbook", error: error.message });
  }
};

exports.getLogbooks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { studentId } = req.query;

    let filter = { project: projectId };

    if (req.user.role === "student") {
      filter.student = req.user.id;
    } else if (studentId) {
      filter.student = studentId;
    }

    const logs = await ProjectLogbook.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil logbook", error: error.message });
  }
};

exports.giveFeedback = async (req, res) => {
  try {
    const { logId } = req.params;
    const { feedback } = req.body;

    const log = await ProjectLogbook.findByIdAndUpdate(
      logId,
      { feedback, status: "reviewed" },
      { new: true },
    );

    if (!log)
      return res.status(404).json({ message: "Logbook tidak ditemukan" });

    res.json(log);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal beri feedback", error: error.message });
  }
};
