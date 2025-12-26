const HealthRecord = require("../models/HealthRecord");
const UksVisit = require("../models/UksVisit");

// --- Health Screening (Screening Kesehatan) ---

exports.addHealthRecord = async (req, res) => {
  try {
    const {
      studentId,
      height,
      weight,
      visionLeft,
      visionRight,
      dentalHealth,
      notes,
    } = req.body;

    // Simple BMI Calc
    let bmi = 0;
    if (height && weight) {
      const hMeter = height / 100;
      bmi = (weight / (hMeter * hMeter)).toFixed(2);
    }

    const record = new HealthRecord({
      student: studentId,
      height,
      weight,
      bmi,
      visionLeft,
      visionRight,
      dentalHealth,
      notes,
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal simpan data kesehatan", error: error.message });
  }
};

exports.getHealthRecords = async (req, res) => {
  try {
    // Bisa filter by studentId via query
    const { studentId } = req.query;
    const filter = studentId ? { student: studentId } : {};

    const records = await HealthRecord.find(filter)
      .populate(
        "student",
        "username profile.fullName profile.level profile.class"
      )
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data kesehatan", error: error.message });
  }
};

// --- Daily Visits (Kunjungan Harian) ---

exports.addVisit = async (req, res) => {
  try {
    const {
      studentId,
      complaint,
      diagnosis,
      treatment,
      medicineGiven,
      status,
    } = req.body;

    const visit = new UksVisit({
      student: studentId,
      staff: req.user.id,
      complaint,
      diagnosis,
      treatment,
      medicineGiven,
      status,
    });

    await visit.save();
    res.status(201).json(visit);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal catat kunjungan UKS", error: error.message });
  }
};

exports.getVisits = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      filter = { student: req.user.id };
    }
    // Note: Parent logic would need child linking, skipping for now as per minimal scope

    const visits = await UksVisit.find(filter)
      .populate("student", "username profile.fullName")
      .sort({ date: -1 });
    res.json(visits);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data kunjungan", error: error.message });
  }
};
