const Bill = require("../models/Bill");
const midtransClient = require("midtrans-client");

// Config Midtrans
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "Mid-server-q1kUecRxL9JDtnYIbxzPOHhZ",
  clientKey: "Mid-client-aAUNIuf1fCSll2qz",
});

const User = require("../models/User");

// Admin: Create Bill (Bulk or Single)
exports.createBill = async (req, res) => {
  try {
    // targetType: 'student' | 'class' | 'level'
    // targetValue: studentId | '7A' | '7'
    const { targetType, targetValue, title, amount, dueDate } = req.body;

    let students = [];

    if (targetType === "student") {
      students = await User.find({ _id: targetValue, role: "student" });
    } else if (targetType === "class") {
      students = await User.find({
        "profile.class": targetValue,
        role: "student",
      });
    } else if (targetType === "level") {
      // Regex starts with level (e.g. "7" matches "7A", "7B")
      students = await User.find({
        "profile.class": { $regex: `^${targetValue}`, $options: "i" },
        role: "student",
      });
    } else {
      return res.status(400).json({ message: "Invalid target type" });
    }

    if (students.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada siswa ditemukan untuk target ini" });
    }

    const bills = students.map((s) => ({
      student: s._id,
      title,
      amount,
      dueDate,
      status: "pending",
      paymentType: "manual", // default
    }));

    await Bill.insertMany(bills);

    res.status(201).json({
      message: `Berhasil buat ${bills.length} tagihan`,
      count: bills.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal buat tagihan", error: error.message });
  }
};

// Get Bills
exports.getBills = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "student") {
      query.student = req.user.id;
    } else {
      // Admin filters
      if (req.query.student) query.student = req.query.student;
      if (req.query.status) query.status = req.query.status;
    }

    const bills = await Bill.find(query)
      .populate("student", "username profile")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal ambil tagihan", error: error.message });
  }
};

// Student: Create Midtrans Transaction
exports.createMidtransTransaction = async (req, res) => {
  try {
    const { billId } = req.body;
    const bill = await Bill.findById(billId).populate("student");
    if (!bill)
      return res.status(404).json({ message: "Tagihan tidak ditemukan" });

    // Generate Order ID if not exists or create new for retry?
    // Reuse existing order ID if pending, else generate new
    let orderId = bill.midtransOrderId;
    if (!orderId) {
      orderId = `BILL-${bill._id}-${Date.now()}`;
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: bill.amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: bill.student.profile?.fullName || bill.student.username,
        email: "student@siakad.com", // Dummy or real
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Update Bill
    bill.midtransOrderId = orderId;
    bill.midtransToken = transaction.token;
    bill.paymentType = "online";
    await bill.save();

    res.json({ token: transaction.token, orderId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal init pembayaran", error: error.message });
  }
};

// Check Midtrans Status (Manual Trigger for Localhost)
exports.checkMidtransStatus = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findById(billId);
    if (!bill || !bill.midtransOrderId)
      return res.status(404).json({ message: "Bill/Order not found" });

    // Call Midtrans Status API
    const statusResponse = await snap.transaction.status(bill.midtransOrderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let newStatus = bill.status;

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // potential fraud
      } else if (fraudStatus == "accept") {
        newStatus = "paid";
      }
    } else if (transactionStatus == "settlement") {
      newStatus = "paid";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "failed";
    } else if (transactionStatus == "pending") {
      newStatus = "pending";
    }

    bill.status = newStatus;
    if (newStatus === "paid" && !bill.paidAt) bill.paidAt = new Date();
    bill.midtransStatus = transactionStatus;

    await bill.save();
    res.json({
      message: "Status updated",
      status: newStatus,
      data: statusResponse,
    });
  } catch (e) {
    res.status(500).json({ message: "Check Failed", error: e.message });
  }
};

// Student: Upload Manual Evidence
exports.uploadManualEvidence = async (req, res) => {
  try {
    const { billId, evidenceUrl } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      billId,
      {
        evidence: evidenceUrl,
        status: "waiting_verification",
        paymentType: "manual",
      },
      { new: true },
    );

    res.json(bill);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal upload bukti", error: error.message });
  }
};

// Admin: Confirm Payment
exports.confirmPayment = async (req, res) => {
  try {
    const { billId, action } = req.body; // action: "approve" | "reject"
    const bill = await Bill.findById(billId);

    if (action === "approve") {
      bill.status = "paid";
      bill.paidAt = new Date();
    } else if (action === "reject") {
      bill.status = "failed"; // or pending again?
      // bill.evidence = null; // Maybe keep evidence but status failed
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: "Gagal konfirmasi", error: error.message });
  }
};

// Admin: Get Finance Chart Data (Last 6 Months Income)
exports.getFinanceChartData = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const data = await Bill.aggregate([
      {
        $match: {
          status: "paid",
          updatedAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();

      // Find in data (MongoDB month is 1-indexed)
      const found = data.find((item) => item._id === monthIndex + 1);
      result.push({
        name: monthNames[monthIndex],
        value: found ? found.total : 0,
      });
    }

    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading chart", error: error.message });
  }
};

// Optional: Midtrans Notification Webhook logic here
