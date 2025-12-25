const StudentIncident = require("../models/StudentIncident");
const StudentAchievement = require("../models/StudentAchievement");
const User = require("../models/User");

// --- Incidents / Pelanggaran ---

exports.reportIncident = async (req, res) => {
  try {
    const { studentId, type, description, point, sanction, evidence } =
      req.body;

    const newIncident = new StudentIncident({
      student: studentId,
      reporter: req.user.userId,
      type,
      description,
      point,
      sanction,
      evidence,
    });

    await newIncident.save();
    res.status(201).json(newIncident);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal lapor pelanggaran", error: error.message });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await StudentIncident.find()
      .populate(
        "student",
        "username profile.fullName profile.nisn profile.level"
      ) // Added profile.level if available in user schema mixed type
      .populate("reporter", "username profile.fullName")
      .sort({ date: -1 });
    res.json(incidents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data pelanggaran", error: error.message });
  }
};

// --- Achievements / Prestasi ---

exports.addAchievement = async (req, res) => {
  try {
    const { studentId, title, category, level, description, evidence } =
      req.body;

    const newAchievement = new StudentAchievement({
      student: studentId,
      title,
      category,
      level,
      description,
      evidence,
    });

    await newAchievement.save();
    res.status(201).json(newAchievement);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal tambah prestasi", error: error.message });
  }
};

exports.getAchievements = async (req, res) => {
  try {
    const achievements = await StudentAchievement.find()
      .populate("student", "username profile.fullName")
      .sort({ date: -1 });
    res.json(achievements);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data prestasi", error: error.message });
  }
};
