const Billing = require("../models/Billing");
const User = require("../models/User");

// Buat Tagihan Massal (Contoh: SPP Bulanan)
// Buat Tagihan Massal (Contoh: SPP Bulanan)
exports.generateMonthlyBilling = async (req, res) => {
  try {
    const { title, amount, dueDate, type, targetClass } = req.body;

    let query = { role: "student", isActive: true };
    if (targetClass) {
      query["profile.class"] = targetClass;
    }

    // Ambil siswa sesuai filter
    const students = await User.find(query);

    if (!students.length)
      return res
        .status(400)
        .json({ message: "Tidak ada siswa yang sesuai kriteria" });

    const billings = [];
    let skipped = 0;

    for (const student of students) {
      const billTitle = `${title} - ${student.username}`;

      // Cek duplikasi (optional but good)
      const exists = await Billing.findOne({
        student: student._id,
        title: billTitle,
        status: { $ne: "cancelled" },
      });

      if (!exists) {
        billings.push({
          student: student._id,
          title: billTitle,
          amount,
          type: type || "SPP",
          dueDate,
          status: "unpaid",
        });
      } else {
        skipped++;
      }
    }

    if (billings.length > 0) {
      await Billing.insertMany(billings);
    }

    res.status(201).json({
      message: `Berhasil membuat ${billings.length} tagihan. ${skipped} dilewati (duplikat).`,
      generated: billings.length,
      skipped,
    });
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
