const StudentIncident = require("../models/StudentIncident");
const StudentAchievement = require("../models/StudentAchievement");
const CounselingSession = require("../models/CounselingSession");
const User = require("../models/User");

// --- Incidents / Pelanggaran ---

exports.reportIncident = async (req, res) => {
  try {
    const { studentId, type, description, point, sanction, evidence } =
      req.body;

    const newIncident = new StudentIncident({
      student: studentId,
      reporter: req.user.id,
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
        "username profile.fullName profile.nisn profile.level profile.class"
      )
      .populate("reporter", "username profile.fullName")
      .sort({ date: -1 });
    res.json(incidents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data pelanggaran", error: error.message });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await StudentIncident.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// --- Counseling ---

exports.addCounselingSession = async (req, res) => {
  try {
    const { studentId, type, title, notes, followUp } = req.body;

    const newSession = new CounselingSession({
      student: studentId,
      counselor: req.user.id,
      type,
      title,
      notes,
      followUp,
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal rekam konseling", error: error.message });
  }
};

exports.getCounselingSessions = async (req, res) => {
  try {
    // Jika teacher/admin, bisa lihat semua. Jika student, hanya punya sendiri.
    let query = {};
    if (req.user.role === "student") {
      query = { student: req.user.id };
    }

    const sessions = await CounselingSession.find(query)
      .populate("student", "profile.fullName profile.class")
      .populate("counselor", "profile.fullName")
      .sort({ date: -1 });

    res.json(sessions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal load konseling", error: error.message });
  }
};

// --- Stats & Alerts ---

exports.getViolationStats = async (req, res) => {
  try {
    // Aggregate points per student
    const stats = await StudentIncident.aggregate([
      {
        $group: {
          _id: "$student",
          totalPoints: { $sum: "$point" },
          incidentCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      {
        $unwind: "$studentInfo",
      },
      {
        $project: {
          fullName: "$studentInfo.profile.fullName",
          className: "$studentInfo.profile.class",
          totalPoints: 1,
          incidentCount: 1,
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hitung poin", error: error.message });
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

// --- Letter Generator (Surat Panggilan) ---
exports.getSummonLetterData = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Get Student & Parent Info
    const student = await User.findById(studentId).select("username profile");
    if (!student)
      return res.status(404).json({ message: "Siswa tidak ditemukan" });

    // 2. Calculate Total Points & Recent Incidents
    const incidents = await StudentIncident.find({ student: studentId }).sort({
      date: -1,
    });
    const totalPoints = incidents.reduce((sum, inc) => sum + inc.point, 0);

    // 3. Determine Letter Type
    let letterType = "Surat Pemberitahuan";
    if (totalPoints >= 100) letterType = "Surat Keputusan (DO)";
    else if (totalPoints >= 75) letterType = "Surat Peringatan 3 (SP3)";
    else if (totalPoints >= 50) letterType = "Surat Panggilan Orang Tua (SP2)";
    else if (totalPoints >= 25) letterType = "Surat Peringatan 1 (SP1)";

    res.json({
      student,
      totalPoints,
      letterType,
      incidents: incidents.slice(0, 5), // Top 5 recent violations
      date: new Date(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal generate surat", error: error.message });
  }
};
