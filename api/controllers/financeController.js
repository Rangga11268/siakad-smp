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
      // Cek duplikasi menggunakan title asli (tanpa username)
      const exists = await Billing.findOne({
        student: student._id,
        title: title, // Use original title for proper duplicate check
        status: { $ne: "cancelled" },
      });

      if (!exists) {
        billings.push({
          student: student._id,
          title: title, // Store original title
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

// Chart Data (Income/Outcome) - Dashboard
exports.getFinanceChart = async (req, res) => {
  try {
    // Aggregate paid billings by month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const incomeStats = await Billing.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$paidDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for Chart.js (Labels: Jan-Dec, Data: Income, Expense assumed 0 for now or random for demo if needed)
    // Since we don't have an Expense model, we'll just return Income vs "Target" or similar.
    // Or just Income.

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = new Array(12).fill(0);

    incomeStats.forEach((stat) => {
      data[stat._id - 1] = stat.total;
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Pemasukan (SPP & Lainnya)",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data grafik", error: error.message });
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
      { new: true },
    );

    res.json(billing);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update pembayaran", error: error.message });
  }
};

// Chart Data (Income/Outcome) - Dashboard
exports.getFinanceChart = async (req, res) => {
  try {
    // Aggregate paid billings by month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const incomeStats = await Billing.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$paidDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for Chart.js (Labels: Jan-Dec, Data: Income, Expense assumed 0 for now or random for demo if needed)
    // Since we don't have an Expense model, we'll just return Income vs "Target" or similar.
    // Or just Income.

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = new Array(12).fill(0);

    incomeStats.forEach((stat) => {
      data[stat._id - 1] = stat.total;
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Pemasukan (SPP & Lainnya)",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data grafik", error: error.message });
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

// Chart Data (Income/Outcome) - Dashboard
exports.getFinanceChart = async (req, res) => {
  try {
    // Aggregate paid billings by month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const incomeStats = await Billing.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$paidDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for Chart.js (Labels: Jan-Dec, Data: Income, Expense assumed 0 for now or random for demo if needed)
    // Since we don't have an Expense model, we'll just return Income vs "Target" or similar.
    // Or just Income.

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = new Array(12).fill(0);

    incomeStats.forEach((stat) => {
      data[stat._id - 1] = stat.total;
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Pemasukan (SPP & Lainnya)",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data grafik", error: error.message });
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
        "username profile.fullName profile.nisn profile.class",
      )
      .sort({ createdAt: -1 });

    res.json(billings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil semua tagihan", error: error.message });
  }
};

// Chart Data (Income/Outcome) - Dashboard
exports.getFinanceChart = async (req, res) => {
  try {
    // Aggregate paid billings by month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const incomeStats = await Billing.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$paidDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for Chart.js (Labels: Jan-Dec, Data: Income, Expense assumed 0 for now or random for demo if needed)
    // Since we don't have an Expense model, we'll just return Income vs "Target" or similar.
    // Or just Income.

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = new Array(12).fill(0);

    incomeStats.forEach((stat) => {
      data[stat._id - 1] = stat.total;
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Pemasukan (SPP & Lainnya)",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data grafik", error: error.message });
  }
};

// Laporan Piutang (Aging Report)
exports.getAgingReport = async (req, res) => {
  try {
    const today = new Date();

    // Find all unpaid bills
    const unpaidBills = await Billing.find({ status: "unpaid" }).populate(
      "student",
      "profile.fullName profile.class profile.phone",
    );

    // Group by Student
    const studentDebt = {};

    unpaidBills.forEach((bill) => {
      const studentId = bill.student._id.toString();
      if (!studentDebt[studentId]) {
        studentDebt[studentId] = {
          student: bill.student,
          totalDebt: 0,
          breakdown: {
            current: 0, // < 30 days
            medium: 0, // 30-60 days
            bad: 0, // > 60 days
          },
          bills: [],
        };
      }

      const diffTime = Math.abs(today - new Date(bill.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = today > bill.dueDate;

      studentDebt[studentId].totalDebt += bill.amount;
      studentDebt[studentId].bills.push(bill);

      if (!isOverdue) {
        studentDebt[studentId].breakdown.current += bill.amount;
      } else if (diffDays <= 30) {
        studentDebt[studentId].breakdown.current += bill.amount;
      } else if (diffDays <= 60) {
        studentDebt[studentId].breakdown.medium += bill.amount;
      } else {
        studentDebt[studentId].breakdown.bad += bill.amount;
      }
    });

    // Convert to Array
    const report = Object.values(studentDebt).sort(
      (a, b) => b.totalDebt - a.totalDebt,
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({
      message: "Gagal generate laporan piutang",
      error: error.message,
    });
  }
};

// Chart Data (Income/Outcome) - Dashboard
exports.getFinanceChart = async (req, res) => {
  try {
    // Aggregate paid billings by month for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const incomeStats = await Billing.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$paidDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format for Chart.js (Labels: Jan-Dec, Data: Income, Expense assumed 0 for now or random for demo if needed)
    // Since we don't have an Expense model, we'll just return Income vs "Target" or similar.
    // Or just Income.

    const labels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = new Array(12).fill(0);

    incomeStats.forEach((stat) => {
      data[stat._id - 1] = stat.total;
    });

    res.json({
      labels,
      datasets: [
        {
          label: "Pemasukan (SPP & Lainnya)",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil data grafik", error: error.message });
  }
};
