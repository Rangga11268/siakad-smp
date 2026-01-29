const mongoose = require("mongoose");
const LearningGoal = require("../models/LearningGoal");
const Assessment = require("../models/Assessment");
const Grade = require("../models/Grade");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");
const AcademicYear = require("../models/AcademicYear");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Helper function to generate secure random password
const generateSecurePassword = () => {
  return crypto.randomBytes(4).toString("hex"); // 8 character random password
};

// Helper function to sanitize user response
const sanitizeUserResponse = (user) => {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    profile: {
      fullName: user.profile?.fullName,
      nisn: user.profile?.nisn,
      gender: user.profile?.gender,
      level: user.profile?.level,
      class: user.profile?.class,
      birthPlace: user.profile?.birthPlace,
      birthDate: user.profile?.birthDate,
    },
  };
};

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

// Guru
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "username email profile isActive createdAt",
    );
    res.json(teachers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data guru", error: error.message });
  }
};

// --- Master Data (Mapel & Kelas) ---

// Academic Year
exports.createAcademicYear = async (req, res) => {
  try {
    const newYear = new AcademicYear(req.body);
    await newYear.save();
    res.status(201).json(newYear);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal buat tahun ajaran", error: error.message });
  }
};

exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 });
    res.json(years);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil tahun ajaran", error: error.message });
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
      "username profile.fullName",
    ); // Assuming User model has profile
    res.json(classes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil kelas", error: error.message });
  }
};

// Update Kelas
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("homeroomTeacher", "username profile.fullName");
    if (!updatedClass) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
    res.json(updatedClass);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update kelas", error: error.message });
  }
};

// Ambil Siswa berdasarkan Level (untuk P5)
exports.getStudentsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    // Cari semua kelas di level ini
    const classes = await Class.find({ level }).populate(
      "students",
      "username profile.fullName profile.nisn",
    );

    // Gabungkan semua siswa
    let allStudents = [];
    classes.forEach((cls) => {
      if (cls.students) {
        allStudents = [...allStudents, ...cls.students];
      }
    });

    res.json(allStudents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil siswa per level", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data siswa", error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      username,
      password,
      fullName,
      nisn,
      gender,
      level,
      className,
      birthPlace,
      birthDate,
      address,
      physical,
      family,
    } = req.body;

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Username sudah dipakai" });

    // Generate secure random password if not provided
    const generatedPassword = password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newStudent = new User({
      username,
      email: `${username}@sekolah.id`, // Dummy email generator
      password: hashedPassword,
      role: "student",
      consentGiven: true,
      consentDate: new Date(),
      profile: {
        fullName,
        nisn,
        gender,
        level,
        class: className,
        birthPlace,
        birthDate,
        address,
        physical,
        family,
      },
    });

    await newStudent.save();

    // [New] Sync with Class Model
    if (className) {
      await Class.updateOne(
        { name: className }, // Assuming name is unique or combine with level
        { $addToSet: { students: newStudent._id } },
      );
    }

    // Return sanitized response with generated password
    const sanitizedResponse = sanitizeUserResponse(newStudent);
    res.status(201).json({
      ...sanitizedResponse,
      generatedPassword: password ? undefined : generatedPassword, // Only return if auto-generated
      message: password
        ? "Siswa berhasil dibuat"
        : "Siswa berhasil dibuat. Password: " + generatedPassword,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal tambah siswa", error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student)
      return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json(student);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil detail siswa", error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      nisn,
      gender,
      level,
      className,
      birthPlace,
      birthDate,
      address,
      physical,
      family,
      mutations,
    } = req.body;

    const student = await User.findById(id);
    if (!student)
      return res.status(404).json({ message: "Siswa tidak ditemukan" });

    // Check if class changed
    const oldClass = student.profile.class;

    // Update Profile Fields Deeply
    student.profile.fullName = fullName || student.profile.fullName;
    student.profile.nisn = nisn || student.profile.nisn;
    student.profile.gender = gender || student.profile.gender;
    student.profile.level = level || student.profile.level;
    student.profile.class = className || student.profile.class;
    student.profile.birthPlace = birthPlace || student.profile.birthPlace;
    student.profile.birthDate = birthDate || student.profile.birthDate;
    student.profile.address = address || student.profile.address;

    if (physical)
      student.profile.physical = { ...student.profile.physical, ...physical };
    if (family)
      student.profile.family = { ...student.profile.family, ...family };
    if (mutations) student.profile.mutations = mutations;

    await student.save();

    // [New] Sync with Class Model if class changed
    if (className && className !== oldClass) {
      // Remove from old class
      if (oldClass) {
        await Class.updateOne(
          { name: oldClass },
          { $pull: { students: student._id } },
        );
      }
      // Add to new class
      await Class.updateOne(
        { name: className },
        { $addToSet: { students: student._id } },
      );
    }

    res.json(student);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update siswa", error: error.message });
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

exports.getAssessments = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    let query = {};

    if (classId) {
      // Find Class Name from ID
      const classDoc = await require("../models/Class").findById(classId);
      if (classDoc) {
        query.classes = classDoc.name; // Search in array of strings
      }
    }

    if (subjectId) query.subject = subjectId;

    const assessments = await Assessment.find(query)
      .populate("subject", "name")
      .populate("teacher", "username profile.fullName") // Populate teacher too
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil asesmen", error: error.message });
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

// Generate Rapor Lengkap (Semua Mapel)
exports.generateFullReport = async (req, res) => {
  try {
    const { studentId, academicYear, semester } = req.query; // Use query params for GET

    const subjects = await Subject.find();
    const reportData = [];

    for (const subj of subjects) {
      // Re-use logic or call function if refactored. For now, inline simplified logic.
      const grades = await Grade.find({ student: studentId }).populate({
        path: "assessment",
        match: { subject: subj._id, academicYear, semester }, // Filter by semester too
        populate: { path: "learningGoals" },
      });

      // Filter grades that match assessment (because populate match might return null assessment)
      const validGrades = grades.filter((g) => g.assessment);

      if (!validGrades.length) {
        reportData.push({
          subject: subj,
          score: 0,
          description: "Belum ada nilai.",
          predikat: "D",
        });
        continue;
      }

      // Calculate Score & Description
      let tpScores = {};
      let totalScore = 0;
      let countScore = 0;

      validGrades.forEach((g) => {
        totalScore += g.score;
        countScore++;

        g.assessment.learningGoals.forEach((tp) => {
          if (!tpScores[tp._id])
            tpScores[tp._id] = { desc: tp.description, total: 0, count: 0 };
          tpScores[tp._id].total += g.score;
          tpScores[tp._id].count++;
        });
      });

      const finalScore = Math.round(totalScore / countScore);

      // Determine Predikat
      let predikat = "D";
      if (finalScore >= 90) predikat = "A";
      else if (finalScore >= 80) predikat = "B";
      else if (finalScore >= 70) predikat = "C";

      // Description Logic
      let highest = { avg: -1, desc: "" };
      let lowest = { avg: 101, desc: "" };

      Object.values(tpScores).forEach((t) => {
        const avg = t.total / t.count;
        if (avg > highest.avg) highest = { avg, desc: t.desc };
        if (avg < lowest.avg) lowest = { avg, desc: t.desc };
      });

      let description = "";
      if (highest.desc && lowest.desc && highest.desc !== lowest.desc) {
        description = `Ananda menunjukkan penguasaan yang sangat baik dalam ${highest.desc}, dan perlu peningkatan dalam ${lowest.desc}.`;
      } else if (highest.desc) {
        description = `Ananda memiliki pemahaman yang baik dalam ${highest.desc}.`;
      } else {
        description = "Cukup baik.";
      }

      reportData.push({
        subject: subj,
        score: finalScore,
        predikat,
        description,
      });
    }

    // Get Student Data
    const student = await User.findById(studentId).select("-password");

    // Get Attendance Stats
    const attendanceStats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } }, // Add date range/academic year filter if needed
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const attendanceSummary = {
      sakit: 0,
      izin: 0,
      alpha: 0,
    };

    attendanceStats.forEach((stat) => {
      if (stat._id === "Sick") attendanceSummary.sakit = stat.count;
      else if (stat._id === "Permission") attendanceSummary.izin = stat.count;
      else if (stat._id === "Alpha") attendanceSummary.alpha = stat.count;
    });

    res.json({
      student,
      academicYear,
      semester,
      reports: reportData,
      attendance: attendanceSummary,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal generate rapor lengkap", error: error.message });
  }
};

// --- Class Member Management ---

exports.addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;

    const student = await User.findById(studentId);
    if (!student)
      return res.status(404).json({ message: "Siswa tidak ditemukan" });

    const targetClass = await Class.findById(classId);
    if (!targetClass)
      return res.status(404).json({ message: "Kelas tidak ditemukan" });

    // 1. Remove from old class if exists
    if (student.profile.class && student.profile.class !== targetClass.name) {
      await Class.updateOne(
        { name: student.profile.class },
        { $pull: { students: student._id } },
      );
    }

    // 2. Update Student Profile
    student.profile.class = targetClass.name;
    await student.save();

    // 3. Add to New Class (avoid duplicates)
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: student._id },
    });

    res.json({ message: "Siswa berhasil ditambahkan ke kelas" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal tambah siswa ke kelas", error: error.message });
  }
};

exports.removeStudentFromClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;

    // 1. Update Student Profile
    const student = await User.findById(studentId);
    if (student) {
      student.profile.class = ""; // Remove class assignment
      await student.save();
    }

    // 2. Remove from Class
    await Class.findByIdAndUpdate(classId, {
      $pull: { students: studentId },
    });

    res.json({ message: "Siswa berhasil dihapus dari kelas" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus siswa dari kelas", error: error.message });
  }
};

exports.getClassMembers = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId).populate({
      path: "students",
      select: "username profile.fullName profile.nisn profile.gender",
    });
    if (!cls) return res.status(404).json({ message: "Kelas tidak ditemukan" });
    res.json(cls.students);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil anggota kelas", error: error.message });
  }
};
// --- Student Specific Features ---

exports.getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { academicYear, semester } = req.query;

    const grades = await Grade.find({ student: studentId }).populate({
      path: "assessment",
      match: { academicYear, semester },
      populate: { path: "subject" },
    });

    // Group by Subject and Type
    const grouped = {};

    grades.forEach((g) => {
      // Skip if assessment/subject is missing or filtered out
      if (!g.assessment || !g.assessment.subject) return;

      const subjName = g.assessment.subject.name;
      const type = g.assessment.type || "assignment"; // Default to assignment

      if (!grouped[subjName]) {
        grouped[subjName] = {
          subject: subjName,
          assignmentTotal: 0,
          assignmentCount: 0,
          examTotal: 0,
          examCount: 0,
          totalScore: 0,
          totalCount: 0,
        };
      }

      // Aggregate Total (Overall)
      grouped[subjName].totalScore += g.score;
      grouped[subjName].totalCount += 1;

      // Aggregate by Category
      if (type === "exam") {
        grouped[subjName].examTotal += g.score;
        grouped[subjName].examCount += 1;
      } else {
        // assignment, quiz, project -> Tugas
        grouped[subjName].assignmentTotal += g.score;
        grouped[subjName].assignmentCount += 1;
      }
    });

    // Calculate Averages
    const result = Object.values(grouped).map((item) => ({
      subject: item.subject,
      average: Math.round(item.totalScore / item.totalCount),
      assignmentAvg:
        item.assignmentCount > 0
          ? Math.round(item.assignmentTotal / item.assignmentCount)
          : 0,
      examAvg:
        item.examCount > 0 ? Math.round(item.examTotal / item.examCount) : 0,
    }));

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil niali saya", error: error.message });
  }
};
