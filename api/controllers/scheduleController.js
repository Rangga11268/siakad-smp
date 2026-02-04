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

    // Check for teacher clash (same teacher at overlapping time)
    const teacherClash = await Schedule.findOne({
      teacher,
      day,
      academicYear,
      semester,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (teacherClash) {
      return res.status(400).json({
        message: "Guru sudah memiliki jadwal di waktu tersebut.",
      });
    }

    // Check for class clash (same class at overlapping time)
    const classClash = await Schedule.findOne({
      class: classId,
      day,
      academicYear,
      semester,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (classClash) {
      return res.status(400).json({
        message: "Kelas sudah memiliki jadwal di waktu tersebut.",
      });
    }

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

// Update Schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
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

    // Check for conflicts (excluding current schedule)
    const teacherClash = await Schedule.findOne({
      _id: { $ne: id },
      teacher,
      day,
      academicYear,
      semester,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (teacherClash) {
      return res.status(400).json({
        message: "Guru sudah memiliki jadwal di waktu tersebut.",
      });
    }

    const classClash = await Schedule.findOne({
      _id: { $ne: id },
      class: classId,
      day,
      academicYear,
      semester,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
    });

    if (classClash) {
      return res.status(400).json({
        message: "Kelas sudah memiliki jadwal di waktu tersebut.",
      });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      {
        day,
        startTime,
        endTime,
        subject,
        class: classId,
        teacher,
        academicYear,
        semester,
      },
      { new: true },
    );

    res.json(updatedSchedule);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update jadwal", error: error.message });
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
