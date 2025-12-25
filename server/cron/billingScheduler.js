const cron = require("node-cron");
const Billing = require("../models/Billing");
const User = require("../models/User");

const startBillingScheduler = () => {
  // Run regularly (Every 1st of Month at 00:01)
  // Format: Minute Hour DayMonth Month DayWeek
  cron.schedule("1 0 1 * *", async () => {
    console.log("⏳ Running Monthly Billing Job...");
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
      let count = 0;

      for (const student of students) {
        // Double check uniqueness
        const exists = await Billing.findOne({
          student: student._id,
          title: title,
          status: { $ne: "cancelled" },
        });

        if (!exists) {
          await Billing.create({
            student: student._id,
            title,
            type: "SPP",
            amount: defaultAmount,
            dueDate,
            status: "unpaid",
          });
          count++;
        }
      }

      console.log(
        `✅ Monthly Billing Job Completed: Generated ${count} bills for ${title}`
      );
    } catch (error) {
      console.error("❌ Monthly Billing Job Failed:", error);
    }
  });

  console.log("🕒 Billing Scheduler Initialized (Runs on 1st of every month)");
};

module.exports = { startBillingScheduler };
