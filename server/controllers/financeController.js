const Billing = require("../models/Billing");
const User = require("../models/User");

// Buat Tagihan Massal (Contoh: SPP Bulanan)
exports.generateMonthlyBilling = async (req, res) => {
  try {
    const { title, amount, dueDate, month, year } = req.body;

    // Ambil semua siswa aktif
    const students = await User.find({ role: "student", isActive: true });

    if (!students.length)
      return res.status(400).json({ message: "Tidak ada siswa aktif" });

    const billings = students.map((student) => ({
      student: student._id,
      title: `${title} - ${student.username}`,
      amount,
      type: "SPP",
      dueDate,
      status: "unpaid",
    }));

    await Billing.insertMany(billings);

    res
      .status(201)
      .json({ message: `Berhasil membuat ${billings.length} tagihan` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal generate tagihan", error: error.message });
  }
};

// Bayar Tagihan (Manual oleh Admin Keuangan)
exports.payBilling = async (req, res) => {
  try {
    const { billingId } = req.body;

    const billing = await Billing.findByIdAndUpdate(
      billingId,
      {
        status: "paid",
        paidDate: new Date(),
        paymentMethod: "Manual",
      },
      { new: true }
    );

    res.json(billing);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update pembayaran", error: error.message });
  }
};

// Cek Tagihan Siswa (Untuk Ortu)
exports.getMyBillings = async (req, res) => {
  try {
    // req.user dari middleware auth
    // Jika role parent, cari tagihan anak-anaknya (Logic kompleks skip dulu, assume student login)
    // Jika role student:
    const billings = await Billing.find({ student: req.user.id }).sort({
      dueDate: 1,
    });
    res.json(billings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil tagihan", error: error.message });
  }
};

// Ambil Semua Tagihan (Admin)
exports.getAllBillings = async (req, res) => {
  try {
    const { status, type, studentId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.student = studentId;

    const billings = await Billing.find(query)
      .populate(
        "student",
        "username profile.fullName profile.nisn profile.class"
      )
      .sort({ createdAt: -1 });

    res.json(billings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil semua tagihan", error: error.message });
  }
};
