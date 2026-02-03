const User = require("../models/User");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");
const Assessment = require("../models/Assessment");
const Submission = require("../models/Submission");
const Grade = require("../models/Grade");

// Get Homeroom Dashboard Data
exports.getHomeroomDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Find teacher's homeroom class
    const teacher = await User.findById(teacherId);
    if (!teacher.isHomeroomTeacher || !teacher.homeroomClass) {
      return res.status(403).json({ message: "Anda bukan wali kelas" });
    }

    const homeroomClass = await Class.findById(teacher.homeroomClass).populate(
      "students",
      "profile.fullName profile.avatar profile.gender profile.nisn",
    );

    if (!homeroomClass) {
      return res.status(404).json({ message: "Kelas tidak ditemukan" });
    }

    const studentIds = homeroomClass.students.map((s) => s._id);
    const totalStudents = studentIds.length;

    // Get attendance stats for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: startOfMonth },
    });

    const attendanceStats = {
      present: attendanceRecords.filter((a) => a.status === "Present").length,
      sick: attendanceRecords.filter((a) => a.status === "Sick").length,
      permission: attendanceRecords.filter((a) => a.status === "Permission")
        .length,
      absent: attendanceRecords.filter((a) => a.status === "Absent").length,
    };

    // Get recent assessments for this class
    const recentAssessments = await Assessment.find({
      classes: homeroomClass.name,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("subject", "name")
      .populate("teacher", "profile.fullName");

    // Get submission stats
    const submissions = await Submission.find({
      student: { $in: studentIds },
      createdAt: { $gte: startOfMonth },
    });

    const submissionStats = {
      total: submissions.length,
      graded: submissions.filter((s) => s.status === "graded").length,
      pending: submissions.filter((s) => s.status === "submitted").length,
      late: submissions.filter((s) => s.status === "late").length,
    };

    // Calculate average grade
    const gradedSubmissions = submissions.filter((s) => s.grade !== undefined);
    const avgGrade =
      gradedSubmissions.length > 0
        ? Math.round(
            gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) /
              gradedSubmissions.length,
          )
        : 0;

    res.json({
      class: {
        _id: homeroomClass._id,
        name: homeroomClass.name,
        level: homeroomClass.level,
        room: homeroomClass.room,
      },
      totalStudents,
      students: homeroomClass.students,
      attendanceStats,
      submissionStats,
      avgGrade,
      recentAssessments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat dashboard", error: error.message });
  }
};

// Get Class Attendance Summary
exports.getClassAttendanceSummary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    if (!teacher.isHomeroomTeacher || !teacher.homeroomClass) {
      return res.status(403).json({ message: "Anda bukan wali kelas" });
    }

    const homeroomClass = await Class.findById(teacher.homeroomClass).populate(
      "students",
      "profile.fullName profile.avatar",
    );

    const studentIds = homeroomClass.students.map((s) => s._id);

    // Get all attendance for current semester
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
    }).populate("student", "profile.fullName");

    // Group by student
    const studentAttendance = homeroomClass.students.map((student) => {
      const records = attendanceRecords.filter(
        (a) => a.student._id.toString() === student._id.toString(),
      );
      return {
        student: {
          _id: student._id,
          fullName: student.profile?.fullName,
          avatar: student.profile?.avatar,
        },
        present: records.filter((r) => r.status === "Present").length,
        sick: records.filter((r) => r.status === "Sick").length,
        permission: records.filter((r) => r.status === "Permission").length,
        absent: records.filter((r) => r.status === "Absent").length,
        total: records.length,
      };
    });

    res.json({
      className: homeroomClass.name,
      students: studentAttendance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat rekap absensi", error: error.message });
  }
};

// Get Class Grades Summary
exports.getClassGradesSummary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    if (!teacher.isHomeroomTeacher || !teacher.homeroomClass) {
      return res.status(403).json({ message: "Anda bukan wali kelas" });
    }

    const homeroomClass = await Class.findById(teacher.homeroomClass).populate(
      "students",
      "profile.fullName profile.avatar",
    );

    const studentIds = homeroomClass.students.map((s) => s._id);

    // Get all grades
    const grades = await Grade.find({
      student: { $in: studentIds },
    })
      .populate("student", "profile.fullName")
      .populate("assessment", "title subject type")
      .populate({
        path: "assessment",
        populate: { path: "subject", select: "name" },
      });

    // Group by student
    const studentGrades = homeroomClass.students.map((student) => {
      const studentGradeRecords = grades.filter(
        (g) => g.student._id.toString() === student._id.toString(),
      );
      const avgScore =
        studentGradeRecords.length > 0
          ? Math.round(
              studentGradeRecords.reduce((sum, g) => sum + g.score, 0) /
                studentGradeRecords.length,
            )
          : 0;

      return {
        student: {
          _id: student._id,
          fullName: student.profile?.fullName,
          avatar: student.profile?.avatar,
        },
        totalAssessments: studentGradeRecords.length,
        avgScore,
        grades: studentGradeRecords.slice(0, 5), // Recent 5 grades
      };
    });

    res.json({
      className: homeroomClass.name,
      students: studentGrades,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat rekap nilai", error: error.message });
  }
};

// Get Student Detail for Homeroom
exports.getStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    if (!teacher.isHomeroomTeacher) {
      return res.status(403).json({ message: "Anda bukan wali kelas" });
    }

    // Verify student is in teacher's class
    const homeroomClass = await Class.findById(teacher.homeroomClass);
    if (!homeroomClass.students.includes(studentId)) {
      return res
        .status(403)
        .json({ message: "Siswa bukan anggota kelas Anda" });
    }

    const student = await User.findById(studentId).select("-password");

    // Get student's attendance
    const attendance = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(30);

    // Get student's submissions
    const submissions = await Submission.find({ student: studentId })
      .populate("assessment", "title subject type deadline")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get student's grades
    const grades = await Grade.find({ student: studentId })
      .populate({
        path: "assessment",
        populate: { path: "subject", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json({
      student,
      recentAttendance: attendance,
      recentSubmissions: submissions,
      grades,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat detail siswa", error: error.message });
  }
};
