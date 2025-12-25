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

// Penilaian P5
const ProjectAssessment = require("../models/ProjectAssessment");

exports.inputAssessment = async (req, res) => {
  try {
    const { projectId, studentId, scores, finalNotes, facilitatorId } =
      req.body;

    const assessment = await ProjectAssessment.findOneAndUpdate(
      { project: projectId, student: studentId },
      {
        facilitator: facilitatorId || req.user.userId,
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
