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
// Absen Mandiri (Siswa)
exports.recordSelfAttendance = async (req, res) => {
  try {
    const studentId = req.user.id; // From Auth Middleware
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cek apakah sudah absen hari ini
    const existing = await Attendance.findOne({
      student: studentId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Anda sudah absen hari ini." });
    }

    // Cari kelas siswa untuk data lengkap (optional but good for consistency)
    const studentUser = await User.findById(studentId);
    if (!studentUser)
      return res.status(404).json({ message: "Siswa tidak ditemukan." });

    // Cari Class ID berdasarkan nama kelas di profile
    // Note: Schema Attendance butuh Class ID.
    // Kita cari Class model
    const studentClass = await Class.findOne({
      name: studentUser.profile.class,
    });

    // Default status Present
    const newAttendance = new Attendance({
      student: studentId,
      class: studentClass ? studentClass._id : null, // Bisa null jika belum masuk kelas, tapi idealnya punya kelas
      date: today,
      status: "Present",
      academicYear: req.body.academicYear, // Client harus kirim atau kita ambil active year
      note: "Absen Mandiri via Dashboard",
      recordedBy: studentId,
    });

    await newAttendance.save();
    res.json({ message: "Berhasil absen masuk!", attendance: newAttendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal absen mandiri", error: error.message });
  }
};
// Absen Mapel (Siswa/Guru)
exports.recordSubjectAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { scheduleId, status, note, date } = req.body; // status defaults to Present if self-absen

    const today = date ? new Date(date) : new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = await mongoose.model("Schedule").findById(scheduleId);
    if (!schedule)
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    // Cek Duplikasi per Mapel & Hari
    const existing = await Attendance.findOne({
      student: studentId,
      schedule: scheduleId,
      date: today,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Sudah absen untuk mapel ini hari ini." });
    }

    const newAttendance = new Attendance({
      student: studentId,
      class: schedule.class,
      subject: schedule.subject,
      schedule: schedule._id,
      date: today,
      status: status || "Present",
      note: note || "Absen Mapel",
      recordedBy: req.user.id,
      academicYear: schedule.academicYear,
    });

    await newAttendance.save();
    res.json({ message: "Berhasil absen mapel", attendance: newAttendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal absen mapel", error: error.message });
  }
};
