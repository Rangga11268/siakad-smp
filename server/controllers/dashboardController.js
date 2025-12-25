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
      averageGradeData.length > 0 ? averageGradeData[0].avg.toFixed(1) : 0;

    res.json({
      studentCount,
      incidentCount,
      totalUnpaid,
      averageGrade,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal ambil statistik dashboard",
        error: error.message,
      });
  }
};
