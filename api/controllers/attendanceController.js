const Attendance = require("../models/Attendance");
const Class = require("../models/Class");
const User = require("../models/User");
const Schedule = require("../models/Schedule"); // Fixed import
const AcademicYear = require("../models/AcademicYear");
const mongoose = require("mongoose");

// ... (existing code)

// Absen Mapel (Siswa/Guru)

exports.recordBatchAttendance = async (req, res) => {
  try {
    const { classId, date, records, academicYearId, scheduleId, subjectId } =
      req.body;
    // records = [{ studentId, status, note }]

    // Pastikan tanggal diset ke midnight untuk konsistensi
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = records.map((record) => {
      // Build filter
      const filter = {
        student: record.studentId,
        date: attendanceDate,
      };

      // If subject attendance, include schedule (or subject) in filter
      if (scheduleId) {
        filter.schedule = scheduleId;
      } else {
        // For daily attendance, ensure we target the record WITHOUT schedule. strictly speaking, we want to find the record where schedule/subject does NOT exist
        filter.schedule = { $exists: false };
      }

      // Build update payload
      const updatePayload = {
        class: classId,
        academicYear: academicYearId,
        status: record.status,
        note: record.note,
        recordedBy: req.user.id,
      };

      if (scheduleId) updatePayload.schedule = scheduleId;
      if (subjectId) updatePayload.subject = subjectId;

      return {
        updateOne: {
          filter: filter,
          update: { $set: updatePayload },
          upsert: true,
        },
      };
    });

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
    const { classId, date, scheduleId } = req.query;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const filter = {
      class: classId,
      date: { $gte: attendanceDate, $lt: nextDay },
    };

    if (scheduleId) {
      filter.schedule = scheduleId;
    } else {
      // By default, get "Daily" attendance (no schedule linked)
      filter.schedule = { $exists: false };
    }

    // Ambil data absensi yg sudah ada
    const attendanceRecords = await Attendance.find(filter);

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
// Absen Mandiri (Siswa) Absen Mandiri (Siswa)
exports.recordSelfAttendance = async (req, res) => {
  try {
    const studentId = req.user.id; // From Auth Middleware
    const today = new Date();
    const currentHour = today.getHours();
    const dayOfWeek = today.getDay(); // 0=Sunday, 6=Saturday

    // Validasi Hari: Tidak bisa absen di akhir pekan
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({
        message: "Tidak bisa absen di hari libur (Sabtu/Minggu).",
      });
    }

    // Validasi Waktu: Absen hanya boleh jam 06:00 - 15:00
    if (currentHour < 6 || currentHour >= 15) {
      return res.status(400).json({
        message: "Absen mandiri ditutup. Silahkan absen antara 06:00 - 15:00.",
      });
    }

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

    if (!studentUser.profile || !studentUser.profile.class) {
      return res
        .status(400)
        .json({ message: "Data kelas Anda belum diatur. Hubungi Admin." });
    }

    // Cari Class ID berdasarkan nama kelas di profile Note: Schema Attendance butuh Class ID. Kita cari Class model
    const studentClass = await Class.findOne({
      name: studentUser.profile.class,
    });

    if (!studentClass) {
      return res.status(400).json({
        message: `Kelas '${studentUser.profile.class}' tidak ditemukan di sistem. Hubungi Admin.`,
      });
    }

    // Get Active Academic Year if not provided Get Active Academic Year if not provided
    let academicYearId = req.body.academicYear;
    if (!academicYearId) {
      const activeYear = await AcademicYear.findOne({ status: "Active" }); // Use top-level require
      if (activeYear) academicYearId = activeYear._id;
    }

    // Default status Present
    const newAttendance = new Attendance({
      student: studentId,
      class: studentClass._id,
      date: today,
      status: "Present",
      academicYear: academicYearId,
      note: "Absen Mandiri via Dashboard",
      recordedBy: studentId,
    });

    await newAttendance.save();
    res.json({ message: "Berhasil absen masuk!", attendance: newAttendance });
  } catch (error) {
    console.error("Self attendance error:", error);
    res
      .status(500)
      .json({ message: "Gagal absen mandiri", error: error.message });
  }
};
// Absen Mapel (Siswa/Guru)
exports.recordSubjectAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { scheduleId, status, note, date } = req.body;

    const schedule = await Schedule.findById(scheduleId).populate("subject");
    if (!schedule) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const today = date ? new Date(date) : new Date();
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const todayName = dayNames[today.getDay()];

    // 1. Validasi Hari
    if (schedule.day !== todayName && !date) {
      return res.status(400).json({
        message: `Jadwal ini untuk hari ${schedule.day}, bukan hari ini.`,
      });
    }

    // 2. Validasi Waktu (Hanya untuk Siswa)
    if (req.user.role === "student") {
      const now = new Date();
      const [startHour, startMin] = schedule.startTime.split(":").map(Number);
      const [endHour, endMin] = schedule.endTime.split(":").map(Number);

      const startTime = new Date(now);
      startTime.setHours(startHour, startMin, 0, 0);
      // Toleransi 15 menit sebelum mulai
      startTime.setMinutes(startTime.getMinutes() - 15);

      const endTime = new Date(now);
      endTime.setHours(endHour, endMin, 0, 0);

      if (now < startTime) {
        return res.status(400).json({
          message: "Belum waktunya absen. Silahkan tunggu jadwal dimulai.",
        });
      }
      if (now > endTime) {
        return res.status(400).json({
          message: "Waktu absen untuk mata pelajaran ini sudah berakhir.",
        });
      }
    }

    today.setHours(0, 0, 0, 0);

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
      subject: schedule.subject._id,
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

// Ambil Absensi per Jadwal (Untuk Monitoring Guru)
exports.getAttendanceBySchedule = async (req, res) => {
  try {
    const { scheduleId, date } = req.query;
    const attendanceDate = new Date(date || new Date());
    attendanceDate.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      schedule: scheduleId,
      date: attendanceDate,
    }).populate("student", "username profile");

    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil histori absensi", error: error.message });
  }
};
