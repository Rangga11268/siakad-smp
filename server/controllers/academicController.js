const LearningGoal = require("../models/LearningGoal");
const Assessment = require("../models/Assessment");
const Grade = require("../models/Grade");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// --- Master Data (Mapel & Kelas) ---

// Mapel
exports.createSubject = async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: "Gagal buat mapel", error: error.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil mapel", error: error.message });
  }
};

// Kelas
exports.createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Gagal buat kelas", error: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate(
      "homeroomTeacher",
      "username profile.fullName"
    ); // Assuming User model has profile
    res.json(classes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil kelas", error: error.message });
  }
};

// Ambil Siswa berdasarkan Level (untuk P5)
exports.getStudentsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    // Cari semua kelas di level ini
    const classes = await Class.find({ level }).populate(
      "students",
      "username profile.fullName profile.nisn"
    );

    // Gabungkan semua siswa
    let allStudents = [];
    classes.forEach((cls) => {
      if (cls.students) {
        allStudents = [...allStudents, ...cls.students];
      }
    });

    // Remove duplicates if any (though students should be unique to a class)
    // const uniqueStudents = Array.from(new Set(allStudents.map(s => s._id))).map(id => allStudents.find(s => s._id === id));

    res.json(allStudents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil siswa per level", error: error.message });
  }
};

// --- Tujuan Pembelajaran (TP) ---

// Buat TP baru
exports.createLearningGoal = async (req, res) => {
  try {
    const { subject, academicYear, level, code, description, semester } =
      req.body;

    const newTP = new LearningGoal({
      subject,
      academicYear,
      level,
      code,
      description,
      semester,
    });
    await newTP.save();

    res.status(201).json(newTP);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat TP", error: error.message });
  }
};

// Ambil semua TP berdasarkan Mapel & Kelas
exports.getLearningGoals = async (req, res) => {
  try {
    const { subjectId, level } = req.query;
    const goals = await LearningGoal.find({ subject: subjectId, level });
    res.json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data TP", error: error.message });
  }
};

// --- Asesmen & Penilaian ---

// Buat Asesmen baru (Tagging TP)
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      type,
      subject,
      class: classId,
      teacher,
      academicYear,
      semester,
      learningGoals,
    } = req.body;

    const newAssessment = new Assessment({
      title,
      type,
      subject,
      class: classId,
      teacher,
      academicYear,
      semester,
      learningGoals,
    });
    await newAssessment.save();

    res.status(201).json(newAssessment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat asesmen", error: error.message });
  }
};

// Input Nilai Siswa
exports.inputGrades = async (req, res) => {
  try {
    const { assessmentId, grades } = req.body; // grades = [{ studentId, score, feedback }]

    // Validasi Asesmen
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment)
      return res.status(404).json({ message: "Asesmen tidak ditemukan" });

    // Loop insert/update nilai
    const bulkOps = grades.map((g) => ({
      updateOne: {
        filter: { assessment: assessmentId, student: g.studentId },
        update: { score: g.score, feedback: g.feedback },
        upsert: true,
      },
    }));

    await Grade.bulkWrite(bulkOps);

    res.json({ message: "Nilai berhasil disimpan" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal input nilai", error: error.message });
  }
};

// Ambil Rekap Nilai per Kelas (Untuk Analisis)
exports.getClassGrades = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const grades = await Grade.find({ assessment: assessmentId })
      .populate("student", "username profile.fullName")
      .populate("assessment");

    res.json(grades);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil rekap nilai", error: error.message });
  }
};

// Generate Rapor (Auto Description)
exports.generateReport = async (req, res) => {
  try {
    const { studentId, subjectId, academicYear } = req.body;

    // Ambil semua nilai siswa untuk mapel ini
    const grades = await Grade.find({ student: studentId }).populate({
      path: "assessment",
      match: { subject: subjectId, academicYear },
      populate: { path: "learningGoals" }, // Load TP untuk analisis
    });

    if (!grades.length) return res.json({ message: "Belum ada data nilai" });

    // Analisis Kekuatan & Kelemahan per TP
    let tpScores = {};

    grades.forEach((grade) => {
      if (!grade.assessment || !grade.assessment.learningGoals) return;

      grade.assessment.learningGoals.forEach((tp) => {
        if (!tpScores[tp._id]) {
          tpScores[tp._id] = {
            description: tp.description,
            total: 0,
            count: 0,
          };
        }
        tpScores[tp._id].total += grade.score;
        tpScores[tp._id].count += 1;
      });
    });

    // Cari TP Tertinggi & Terendah
    let highestTP = null;
    let lowestTP = null;
    let maxAvg = -1;
    let minAvg = 101;

    Object.values(tpScores).forEach((tp) => {
      const avg = tp.total / tp.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        highestTP = tp.description;
      }
      if (avg < minAvg) {
        minAvg = avg;
        lowestTP = tp.description;
      }
    });

    // Susun Kalimat Deskripsi (Logic sederhana)
    // Jika highest sama dengan lowest (misal cuma 1 TP atau nilai sama rata), sesuaikan kalimat
    let description = "";
    if (highestTP === lowestTP) {
      description = `Ananda sudah mencapai kompetensi ${highestTP} dengan baik.`;
    } else {
      description = `Ananda sangat menguasai dalam hal ${highestTP}, namun perlu bimbingan lebih lanjut dalam ${lowestTP}.`;
    }

    res.json({
      studentId,
      subjectId,
      finalScore: Math.round((maxAvg + minAvg) / 2),
      description,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal generate rapor", error: error.message });
  }
};
