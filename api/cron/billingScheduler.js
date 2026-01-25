const cron = require("node-cron");
const Billing = require("../models/Billing");
const User = require("../models/User");
const logger = require("../config/logger");

const startBillingScheduler = () => {
  // Run regularly (Every 1st of Month at 00:01)
  // Format: Minute Hour DayMonth Month DayWeek
  cron.schedule("1 0 1 * *", async () => {
    logger.info("⏳ Running Monthly Billing Job...");
    try {
      const today = new Date();
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const month = monthNames[today.getMonth()];
      const year = today.getFullYear();
      const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;

      const title = `SPP ${month} ${year}`;
      const defaultAmount = 150000; // Hardcoded default SPP (could be from Settings)
      const dueDate = new Date(year, today.getMonth(), 10); // Due date: 10th of month

      // Get Active Students
      const students = await User.find({ role: "student", isActive: true });

      if (students.length === 0) {
        logger.warn("⚠️ No active students found");
        return;
      }

      // Fetch existing billings for this title to avoid duplicates
      const existingBills = await Billing.find({
        title: title,
        status: { $ne: "cancelled" },
      }).select("student");

      // Create a Set of student IDs that already have bills
      const existingStudentIds = new Set(
        existingBills.map((bill) => bill.student.toString()),
      );

      // Filter students who don't have this bill yet
      const newBillings = students
        .filter((student) => !existingStudentIds.has(student._id.toString()))
        .map((student) => ({
          student: student._id,
          title,
          type: "SPP",
          amount: defaultAmount,
          dueDate,
          status: "unpaid",
        }));

      // Bulk insert all new billings at once
      if (newBillings.length > 0) {
        await Billing.insertMany(newBillings);
        logger.info(
          `✅ Monthly Billing Job Completed: Generated ${newBillings.length} bills for ${title}`,
        );
      } else {
        logger.info(`ℹ️ All students already have billing for ${title}`);
      }
    } catch (error) {
      logger.error("❌ Monthly Billing Job Failed:", error);
    }
  });

  logger.info("🕒 Billing Scheduler Initialized (Runs on 1st of every month)");
};

module.exports = { startBillingScheduler };
