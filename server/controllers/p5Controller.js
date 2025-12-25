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

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (level) query.level = level;

    console.log("Fetching P5 Projects with query:", query);

    const projects = await ProjectP5.find(query).populate(
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
      { new: true, upsert: true } // Create if not exists
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
    const project = await ProjectP5.findById(projectId);
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
