const TeachingJournal = require("../models/TeachingJournal");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Buat Jurnal Baru
exports.createJournal = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      date,
      startTime,
      endTime,
      topic,
      method,
      studentActivity,
      notes,
    } = req.body;

    // Handle materials array (sent as materials[])
    const materials = req.body["materials[]"] || [];

    let attachments = [];
    if (req.file) {
      // Save relative path
      attachments.push(`/uploads/${req.file.filename}`);
    }

    const newJournal = new TeachingJournal({
      teacher: req.user.id,
      class: classId,
      subject: subjectId,
      date,
      startTime,
      endTime,
      topic,
      method,
      studentActivity,
      notes,
      attachments,
      materials: Array.isArray(materials)
        ? materials
        : [materials].filter(Boolean),
    });

    await newJournal.save();
    res.status(201).json(newJournal);
  } catch (error) {
    console.error("Journal creation error:", error);
    res
      .status(500)
      .json({ message: "Gagal buat jurnal", error: error.message });
  }
};

// Ambil Jurnal Saya (Guru)
exports.getMyJournals = async (req, res) => {
  try {
    const journals = await TeachingJournal.find({ teacher: req.user.id })
      .populate("class", "name")
      .populate("subject", "name")
      .sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil jurnal", error: error.message });
  }
};

// Ambil Jurnal per Kelas (Admin/Wali Kelas)
exports.getJournalsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const journals = await TeachingJournal.find({ class: classId })
      .populate("teacher", "username profile.fullName")
      .populate("subject", "name")
      .sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil jurnal kelas", error: error.message });
  }
};

// Ambil Semua Jurnal (Admin - Monitoring)
exports.getAllJournals = async (req, res) => {
  try {
    const journals = await TeachingJournal.find()
      .populate("teacher", "username profile.fullName")
      .populate("class", "name")
      .populate("subject", "name")
      .sort({ date: -1 });
    res.json(journals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil semua jurnal", error: error.message });
  }
};

// Update Jurnal (Guru - hanya dalam 7 hari)
exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const journal = await TeachingJournal.findById(id);

    if (!journal) {
      return res.status(404).json({ message: "Jurnal tidak ditemukan" });
    }

    // Check ownership (guru hanya bisa edit miliknya, admin bisa semua)
    if (
      req.user.role !== "admin" &&
      journal.teacher.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Tidak memiliki akses" });
    }

    // Time limit check (7 days) - only for teachers, not admin
    if (req.user.role !== "admin") {
      const createdAt = new Date(journal.createdAt);
      const now = new Date();
      const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        return res.status(400).json({
          message: "Jurnal hanya bisa diedit dalam 7 hari setelah dibuat",
        });
      }
    }

    const {
      classId,
      subjectId,
      date,
      startTime,
      endTime,
      topic,
      method,
      studentActivity,
      notes,
    } = req.body;

    // Update fields
    if (classId) journal.class = classId;
    if (subjectId) journal.subject = subjectId;
    if (date) journal.date = date;
    if (startTime) journal.startTime = startTime;
    if (endTime) journal.endTime = endTime;
    if (topic) journal.topic = topic;
    if (method) journal.method = method;
    if (studentActivity !== undefined)
      journal.studentActivity = studentActivity;
    if (notes !== undefined) journal.notes = notes;

    // Handle new attachment
    if (req.file) {
      journal.attachments.push(`/uploads/${req.file.filename}`);
    }

    await journal.save();

    const updated = await TeachingJournal.findById(id)
      .populate("class", "name")
      .populate("subject", "name");

    res.json(updated);
  } catch (error) {
    console.error("Journal update error:", error);
    res
      .status(500)
      .json({ message: "Gagal update jurnal", error: error.message });
  }
};

// Hapus Jurnal (Admin only)
exports.deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const journal = await TeachingJournal.findById(id);

    if (!journal) {
      return res.status(404).json({ message: "Jurnal tidak ditemukan" });
    }

    // Only admin can delete
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang bisa menghapus jurnal" });
    }

    await TeachingJournal.findByIdAndDelete(id);
    res.json({ message: "Jurnal berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus jurnal", error: error.message });
  }
};
