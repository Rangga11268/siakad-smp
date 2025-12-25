const HealthRecord = require("../models/HealthRecord");

// Catat Pemeriksaan Kesehatan / Kunjungan
exports.createRecord = async (req, res) => {
  try {
    const { studentId, height, weight, complaint, diagnosis, treatment } =
      req.body;

    let bmi = null;
    let status = null;

    // Hitung BMI jika ada TB/BB
    if (height && weight) {
      const hMeter = height / 100;
      bmi = (weight / (hMeter * hMeter)).toFixed(2);

      if (bmi < 18.5) status = "Underweight";
      else if (bmi < 25) status = "Normal";
      else if (bmi < 30) status = "Overweight";
      else status = "Obese";
    }

    const newRecord = new HealthRecord({
      student: studentId,
      height,
      weight,
      bmi,
      status,
      complaint,
      diagnosis,
      treatment,
      handledBy: req.user.id,
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mencatat data kesehatan", error: error.message });
  }
};

// Riwayat Kesehatan Siswa
exports.getStudentRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await HealthRecord.find({ student: studentId }).sort({
      date: -1,
    });
    res.json(records);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data kesehatan", error: error.message });
  }
};
