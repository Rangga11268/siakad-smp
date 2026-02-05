const User = require("../models/User");
const StudentIncident = require("../models/StudentIncident");
const Bill = require("../models/Bill");
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
    const unpaidBills = await Bill.aggregate([
      { $match: { status: { $in: ["pending", "waiting_verification"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalUnpaid = unpaidBills.length > 0 ? unpaidBills[0].total : 0;

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

    // 2. Unpaid Bills (pending or waiting for verification)
    const unpaidBillCount = await Bill.countDocuments({
      student: studentId,
      status: { $in: ["pending", "waiting_verification"] },
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
      unpaidBills: unpaidBillCount,
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
    }).select("_id title subject classes deadline type");

    const myAssessmentIds = myAssessments.map((a) => a._id);

    // Count total pending
    const pendingGrading = await Submission.countDocuments({
      assessment: { $in: myAssessmentIds },
      status: "submitted",
    });

    // Get Pending Grading Details (Top 3)
    // Group submissions by assessment to find which ones need attention
    const pendingDetailsRaw = await Submission.aggregate([
      {
        $match: {
          assessment: { $in: myAssessmentIds },
          status: "submitted",
        },
      },
      {
        $group: {
          _id: "$assessment",
          count: { $sum: 1 },
        },
      },
      { $limit: 3 },
    ]);

    // Map back to assessment details
    const pendingGradingDetails = pendingDetailsRaw.map((item) => {
      const assessment = myAssessments.find(
        (a) => a._id.toString() === item._id.toString(),
      );
      return {
        _id: item._id,
        title: assessment ? assessment.title : "Unknown Assignment",
        count: item.count,
        deadline: assessment ? assessment.deadline : null,
      };
    });

    // 3. Missing Attendance (Yesterday)
    const Attendance = require("../models/Attendance");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const yesterdayName = days[yesterday.getDay()];

    const missingAttendance = [];
    if (activeYear) {
      // Find schedules for yesterday
      const yesterdaySchedules = await Schedule.find({
        teacher: teacherId,
        day: yesterdayName,
        academicYear: activeYear._id,
        semester: activeYear.semester,
      })
        .populate("class", "name")
        .populate("subject", "name");

      // Check if attendance exists for each
      for (const schedule of yesterdaySchedules) {
        const hasAttendance = await Attendance.exists({
          schedule: schedule._id,
          date: yesterday,
        });

        if (!hasAttendance) {
          missingAttendance.push({
            scheduleId: schedule._id,
            className: schedule.class ? schedule.class.name : "Unknown Class",
            subjectName: schedule.subject
              ? schedule.subject.name
              : "Unknown Subject",
            time: `${schedule.startTime}`,
          });
        }
      }
    }

    // 4. Homeroom Class
    const Class = require("../models/Class");
    const homeroomClass = await Class.findOne({ homeroomTeacher: teacherId });

    // Additional Homeroom Stats if exists
    let classStats = {};
    if (homeroomClass) {
      const User = require("../models/User");
      classStats.studentCount = await User.countDocuments({
        role: "student",
        "profile.class": homeroomClass.name,
      });

      // Today's Attendance Rate for Homeroom
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(todayDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const totalAttendance = await Attendance.countDocuments({
        class: homeroomClass._id,
        date: { $gte: todayDate, $lt: nextDay },
        status: "Present",
      });

      // Simple calculation: (Present / Total) * 100.
      // Note: This is an approximation as it depends on whether attendance was TAKEN.
      // A better metric might be % of students who have ANY attendance record today.

      const recordsCount = await Attendance.distinct("student", {
        class: homeroomClass._id,
        date: { $gte: todayDate, $lt: nextDay },
      }).then((res) => res.length);

      classStats.attendanceRate =
        classStats.studentCount > 0
          ? Math.round((recordsCount / classStats.studentCount) * 100)
          : 0;

      // Student Warnings: Find students who have NOT attended today
      // FIX: Only show warnings if the class actually has schedules today!
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const todayName = days[new Date().getDay()];

      const hasScheduleToday = await Schedule.exists({
        class: homeroomClass._id,
        day: todayName,
        academicYear: activeYear ? activeYear._id : null,
      });

      if (classStats.studentCount > 0 && hasScheduleToday) {
        // 1. Get all student IDs in the class
        const allStudents = await User.find({
          role: "student",
          "profile.class": homeroomClass.name,
        }).select("_id profile.fullName"); // Only need ID and Name

        // 2. Get IDs of students who HAVE attended
        const presentStudentIds = await Attendance.find({
          class: homeroomClass._id,
          date: { $gte: todayDate, $lt: nextDay },
        }).distinct("student");

        // 3. Filter out students who are present
        // Convert ObjectIds to strings for comparison
        const presentIdsStr = presentStudentIds.map((id) => id.toString());

        const absentStudents = allStudents.filter(
          (s) => !presentIdsStr.includes(s._id.toString()),
        );

        // Limit to top 3 for dashboard
        classStats.studentWarnings = absentStudents.slice(0, 3).map((s) => ({
          name: s.profile.fullName.split(" ")[0], // First name only for compactness
          issue: "Belum Absen Hari Ini",
        }));

        classStats.absentCount = absentStudents.length;
      } else {
        classStats.studentWarnings = [];
        classStats.absentCount = 0;
      }

      // Pending Submissions for this class (Across all subjects)
      classStats.avgGrade = 85; // Placeholder for expensive Grade aggregation
    }

    res.json({
      teachingHours,
      pendingGrading,
      pendingGradingDetails,
      missingAttendance,
      homeroomClass: homeroomClass ? homeroomClass.name : null,
      classStats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal ambil statistik guru",
      error: error.message,
    });
  }
};
