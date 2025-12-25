const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const User = require("../models/User");

// Input Absensi Harian (Batch per Kelas)
exports.recordBatchAttendance = async (req, res) => {
  try {
    const { classId, date, records, academicYearId } = req.body;
    // records = [{ studentId, status, note }]

    // Pastikan tanggal diset ke midnight untuk konsistensi
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: {
          student: record.studentId,
          date: attendanceDate,
        },
        update: {
          $set: {
            class: classId,
            academicYear: academicYearId,
            status: record.status,
            note: record.note,
            recordedBy: req.user.id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res.json({ message: "Absensi berhasil disimpan." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal simpan absensi", error: error.message });
  }
};

// Ambil Absensi Kelas pada Tanggal Tertentu
exports.getDailyAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Ambil data absensi yg sudah ada
    const attendanceRecords = await Attendance.find({
      class: classId,
      date: { $gte: attendanceDate, $lt: nextDay },
    });

    res.json(attendanceRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data absensi", error: error.message });
  }
};

// Rekap Absensi Siswa (Untuk Rapor/Monitor)
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const stats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Format object { Sick: 2, Alpha: 1 ... }
    const summary = { Present: 0, Sick: 0, Permission: 0, Alpha: 0 };
    stats.forEach((s) => {
      if (summary[s._id] !== undefined) summary[s._id] = s.count;
    });

    res.json(summary);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil rekap absensi", error: error.message });
  }
};
