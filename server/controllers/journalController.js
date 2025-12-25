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

    let attachment = "";
    if (req.file) {
      // Save relative path
      attachment = `/uploads/${req.file.filename}`;
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
      attachment,
    });

    await newJournal.save();
    res.status(201).json(newJournal);
  } catch (error) {
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
