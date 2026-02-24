const User = require("../models/User");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");
const Assessment = require("../models/Assessment");
const Submission = require("../models/Submission");
const Grade = require("../models/Grade");

// Middleware to verify parent and get child IDs
const getChildIds = async (parentId) => {
  const parent = await User.findById(parentId).populate("children");
  if (!parent || parent.role !== "parent") {
    throw new Error("User bukan orang tua");
  }
  return parent.children.map((child) => child._id);
};

// Get Parent Dashboard Summary (Overview for all children)
exports.getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user.id;
    const parent = await User.findById(parentId).populate(
      "children",
      "profile.fullName profile.avatar profile.class",
    );

    if (!parent || parent.role !== "parent") {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Bukan akun orang tua." });
    }

    if (!parent.children || parent.children.length === 0) {
      return res.json({
        children: [],
        message: "Belum ada data siswa yang dihubungkan.",
      });
    }

    const childIds = parent.children.map((c) => c._id);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch data for all children
    const attendances = await Attendance.find({
      student: { $in: childIds },
      date: { $gte: startOfMonth },
    });

    const submissions = await Submission.find({ student: { $in: childIds } });

    // Recent pending/active assessments for children's classes
    const childClasses = [
      ...new Set(parent.children.map((c) => c.profile?.class).filter(Boolean)),
    ];
    const recentAssessments = await Assessment.find({
      classes: { $in: childClasses },
      deadline: { $gte: new Date() }, // Upcoming tasks
    })
      .sort({ deadline: 1 })
      .limit(5)
      .populate("subject", "name");

    // Aggregate data per child
    const childrenData = parent.children.map((child) => {
      const childAttendance = attendances.filter(
        (a) => a.student.toString() === child._id.toString(),
      );
      const childSubmissions = submissions.filter(
        (s) => s.student.toString() === child._id.toString(),
      );

      return {
        _id: child._id,
        fullName: child.profile?.fullName,
        class: child.profile?.class,
        avatar: child.profile?.avatar,
        attendanceStats: {
          present: childAttendance.filter((a) => a.status === "Present").length,
          absent: childAttendance.filter((a) =>
            ["Sick", "Permission", "Absent", "Alpha"].includes(a.status),
          ).length,
        },
        taskStats: {
          pending: childSubmissions.filter((s) => s.status === "submitted")
            .length,
          graded: childSubmissions.filter((s) => s.status === "graded").length,
        },
      };
    });

    res.json({
      children: childrenData,
      upcomingTasks: recentAssessments,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal memuat dashboard orang tua",
        error: error.message,
      });
  }
};

// Get Child Detail (Grades, Attendance history)
exports.getChildDetail = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;

    // Verify child belongs to parent
    const childIds = await getChildIds(parentId);
    if (!childIds.some((id) => id.toString() === childId)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Bukan anak Anda." });
    }

    const child = await User.findById(childId).select("profile");

    // 1. Attendance (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAttendance = await Attendance.find({
      student: childId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // 2. Grades
    const grades = await Grade.find({ student: childId })
      .populate({
        path: "assessment",
        populate: { path: "subject", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json({
      child,
      recentAttendance,
      grades,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memuat detail anak", error: error.message });
  }
};
