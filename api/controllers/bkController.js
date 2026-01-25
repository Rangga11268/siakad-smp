const Incident = require("../models/Incident");

// Lapor Insiden (Guru Piket/BK)
exports.reportIncident = async (req, res) => {
  try {
    const { studentId, category, description, location, points, actionTaken } =
      req.body;

    // Auto status based on points or category logic can be added here
    const newIncident = new Incident({
      student: studentId,
      reporter: req.user.id, // Dari Token
      category,
      description,
      location,
      points,
      actionTaken,
    });

    await newIncident.save();

    // TODO: Alert logic jika poin > threshold (misal kirim WA/Notif)

    res.status(201).json(newIncident);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal lapor insiden", error: error.message });
  }
};

// Ambil Riwayat Insiden Siswa
exports.getStudentIncidents = async (req, res) => {
  try {
    const { studentId } = req.params;
    const incidents = await Incident.find({ student: studentId })
      .populate("reporter", "username profile.fullName")
      .sort({ date: -1 });

    res.json(incidents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data insiden", error: error.message });
  }
};

// Update Status Kasus (Misal setelah konseling)
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status, counselingNotes, actionTaken } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      { status, counselingNotes, actionTaken },
      { new: true }
    );

    res.json(incident);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update status insiden", error: error.message });
  }
};
