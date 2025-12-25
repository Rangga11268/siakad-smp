const Schedule = require("../models/Schedule");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// Create Schedule Slot
exports.createSchedule = async (req, res) => {
  try {
    const {
      day,
      startTime,
      endTime,
      subject,
      class: classId,
      teacher,
      academicYear,
      semester,
    } = req.body;

    // Basic Validation: Check for clashes (Optional but good)
    // For now, allow overwrite or duplicate for simplicity phase

    const newSchedule = new Schedule({
      day,
      startTime,
      endTime,
      subject,
      class: classId,
      teacher,
      academicYear,
      semester,
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat jadwal", error: error.message });
  }
};

// Get Schedules (Filter by Class, Teacher, Day)
exports.getSchedules = async (req, res) => {
  try {
    const { classId, teacherId, day, academicYear, semester } = req.query;
    const filter = {};
    if (classId) filter.class = classId;
    if (teacherId) filter.teacher = teacherId;
    if (day) filter.day = day;
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;

    const schedules = await Schedule.find(filter)
      .populate("subject", "name code")
      .populate("class", "name")
      .populate("teacher", "profile.fullName")
      .sort({ day: 1, startTime: 1 });

    res.json(schedules);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil jadwal", error: error.message });
  }
};

// Delete Schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus jadwal", error: error.message });
  }
};
