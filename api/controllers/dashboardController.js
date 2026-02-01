const User = require("../models/User");
const StudentIncident = require("../models/StudentIncident");
const Billing = require("../models/Billing");
const Grade = require("../models/Grade");

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Siswa Aktif
    const studentCount = await User.countDocuments({ role: "student" });

    // 2. Laporan Insiden (Open/FollowUp)
    const incidentCount = await StudentIncident.countDocuments({
      status: { $in: ["Open", "FollowUp"] },
    });

    // 3. Tagihan Belum Lunas (Total Nominal)
    const unpaidBillings = await Billing.aggregate([
      { $match: { status: "unpaid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalUnpaid = unpaidBillings.length > 0 ? unpaidBillings[0].total : 0;

    // 4. Rata-rata Nilai (Semester Ini - Asumsi semua data adalah semester aktif untuk MVP)
    const averageGradeData = await Grade.aggregate([
      { $group: { _id: null, avg: { $avg: "$score" } } },
    ]);
    const averageGrade =
      averageGradeData.length > 0 && averageGradeData[0].avg !== null
        ? averageGradeData[0].avg.toFixed(1)
        : 0;

    res.json({
      studentCount,
      incidentCount,
      totalUnpaid,
      averageGrade,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal ambil statistik dashboard",
      error: error.message,
    });
  }
};

exports.getStudentDashboardStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Attendance Today
    const Attendance = require("../models/Attendance");
    const attendance = await Attendance.findOne({
      student: studentId,
      date: { $gte: today },
    });
    const attendanceStatus = attendance ? attendance.status : "Belum Absen";

    // 2. Unpaid Bills
    const unpaidBills = await Billing.countDocuments({
      student: studentId,
      status: "unpaid",
    });

    // 3. Announcements (Latest 3)
    const News = require("../models/News");
    const announcements = await News.find({
      category: "Pengumuman",
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select("title summary publishedAt slug");

    // 4. Upcoming Assignments (Next 7 Days)
    const Assessment = require("../models/Assessment");
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Find active academic year first
    const AcademicYear = require("../models/AcademicYear");
    const activeYear = await AcademicYear.findOne({ status: "active" });

    // FIX: Fetch full user to get profile.class (req.user only has id & role)
    const user = await User.findById(studentId);

    let pendingTasks = 0;
    // Check if user exists, has profile, and has class
    if (activeYear && user && user.profile && user.profile.class) {
      pendingTasks = await Assessment.countDocuments({
        classes: user.profile.class,
        academicYear: activeYear._id,
        deadline: { $gte: today, $lte: nextWeek },
      });
    }

    res.json({
      attendanceStatus,
      unpaidBills,
      announcements,
      pendingTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal ambil statistik siswa",
      error: error.message,
    });
  }
};
exports.getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { day } = req.query; // e.g. "Senin"

    // 1. Teaching Hours Today
    const Schedule = require("../models/Schedule");
    const AcademicYear = require("../models/AcademicYear");
    const activeYear = await AcademicYear.findOne({ status: "active" });

    let teachingHours = 0;
    if (activeYear) {
      teachingHours = await Schedule.countDocuments({
        teacher: teacherId,
        day: day,
        academicYear: activeYear._id,
        semester: activeYear.semester,
      });
    }

    // 2. Pending Grading (Submissions that are 'submitted' but not 'graded')
    const Assessment = require("../models/Assessment");
    const Submission = require("../models/Submission");

    // Find assessments by this teacher
    const myAssessments = await Assessment.find({
      teacher: teacherId,
      academicYear: activeYear ? activeYear._id : null,
    }).select("_id");

    const myAssessmentIds = myAssessments.map((a) => a._id);

    const pendingGrading = await Submission.countDocuments({
      assessment: { $in: myAssessmentIds },
      status: "submitted",
    });

    // 3. Homeroom Class
    const Class = require("../models/Class");
    const homeroomClass = await Class.findOne({ homeroomTeacher: teacherId });

    res.json({
      teachingHours,
      pendingGrading,
      homeroomClass: homeroomClass ? homeroomClass.name : null,
      homeroomClassId: homeroomClass ? homeroomClass._id : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal ambil statistik guru",
      error: error.message,
    });
  }
};
