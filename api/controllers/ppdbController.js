const ProspectiveStudent = require("../models/ProspectiveStudent");

// Public: Register New Student
exports.register = async (req, res) => {
  try {
    const data = req.body;

    // Check if NISN exists
    const existing = await ProspectiveStudent.findOne({ nisn: data.nisn });
    if (existing) {
      return res.status(400).json({ message: "NISN sudah terdaftar." });
    }

    // Handle Uploaded Files
    if (req.files) {
      if (req.files.docKK) {
        data.docKK = `/uploads/ppdb/${req.files.docKK[0].filename}`;
      }
      if (req.files.docAkta) {
        data.docAkta = `/uploads/ppdb/${req.files.docAkta[0].filename}`;
      }
      if (req.files.docRapor) {
        data.docRapor = `/uploads/ppdb/${req.files.docRapor[0].filename}`;
      }
    }

    const newRegistrant = new ProspectiveStudent(data);
    await newRegistrant.save();

    res
      .status(201)
      .json({ message: "Pendaftaran berhasil", data: newRegistrant });
  } catch (error) {
    res.status(500).json({ message: "Gagal mendaftar", error: error.message });
  }
};

// Public: Check Status
exports.checkStatus = async (req, res) => {
  try {
    const { nisn } = req.params;
    const registrant = await ProspectiveStudent.findOne({ nisn });
    if (!registrant)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    res.json({
      fullname: registrant.fullname,
      status: registrant.status,
      notes: registrant.notes,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking status", error: error.message });
  }
};

// Admin: Get All Registrants
exports.getAllRegistrants = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const registrants = await ProspectiveStudent.find(query).sort({
      createdAt: -1,
    });
    res.json(registrants);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil data", error: error.message });
  }
};

// Admin: Update Status (Verify/Accept/Reject)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await ProspectiveStudent.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true },
    );

    res.json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update status", error: error.message });
  }
};
