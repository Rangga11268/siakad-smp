const Assessment = require("../models/Assessment");
const Submission = require("../models/Submission");

// Create Assessment
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      classes,
      deadline,
      attachments,
      type,
    } = req.body;

    // Fetch Active Academic Year
    const AcademicYear = require("../models/AcademicYear");
    const activeYear = await AcademicYear.findOne({ status: "active" });
    if (!activeYear) {
      return res.status(400).json({ message: "Tidak ada tahun ajaran aktif" });
    }

    const assessment = new Assessment({
      title,
      description,
      subject,
      classes,
      teacher: req.user.id, // from auth middleware
      deadline,
      attachments,
      type,
      academicYear: activeYear._id,
      semester: activeYear.semester,
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat tugas", error: error.message });
  }
};

// Get Assessments (Filterable)
exports.getAssessments = async (req, res) => {
  try {
    const { class: className, subject, teacher } = req.query;
    let query = {};

    if (className) query.classes = className;
    if (subject) query.subject = subject;
    if (teacher) query.teacher = teacher;

    // For students: show only their class assessments
    if (req.user.role === "student") {
      const User = require("../models/User");
      const student = await User.findById(req.user.id);
      if (student && student.profile.class) {
        query.classes = student.profile.class;
      } else {
        // If student has no class, maybe show nothing or all?
        // Safest: show nothing to avoid leak.
        return res.json([]);
      }
    }

    const assessments = await Assessment.find(query)
      .populate("teacher", "username profile")
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil tugas", error: error.message });
  }
};

// Get Single Assessment
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate(
      "teacher",
      "username profile",
    );
    if (!assessment)
      return res.status(404).json({ message: "Tugas tidak ditemukan" });

    // Check if student submitted?
    let submission = null;
    if (req.user.role === "student") {
      submission = await Submission.findOne({
        assessment: assessment._id,
        student: req.user.id,
      });
    }

    res.json({ assessment, submission });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading assessment", error: error.message });
  }
};

// Submit Assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { text, files, driveLink } = req.body;
    const assessmentId = req.params.id;

    // Check existing
    let submission = await Submission.findOne({
      assessment: assessmentId,
      student: req.user.id,
    });

    // Check late?
    const assessment = await Assessment.findById(assessmentId);
    let status = "submitted";
    if (assessment.deadline && new Date() > new Date(assessment.deadline)) {
      status = "late";
    }

    if (submission) {
      // Update
      submission.text = text;
      submission.driveLink = driveLink;
      submission.files = files;
      submission.status = status === "late" ? "late" : submission.status;
      if (submission.grade) submission.status = "submitted";
      submission.submittedAt = new Date();
    } else {
      // Create
      submission = new Submission({
        assessment: assessmentId,
        student: req.user.id,
        text,
        driveLink,
        files,
        status,
      });
    }

    await submission.save();
    res.json(submission);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengirim tugas", error: error.message });
  }
};

const Grade = require("../models/Grade"); // Import Grade model

// ...

// Grade Submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submissionId = req.params.id;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        grade,
        feedback,
        status: "graded",
      },
      { new: true },
    );

    // Sync to Grade Model (Master Gradebook)
    if (submission) {
      await Grade.findOneAndUpdate(
        { assessment: submission.assessment, student: submission.student },
        {
          score: grade,
          feedback: feedback,
        },
        { upsert: true, new: true },
      );
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Gagal menilai", error: error.message });
  }
};

// Get Submissions for an Assessment (Teacher View)
exports.getSubmissionsByAssessment = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assessment: req.params.id,
    }).populate("student", "username profile");
    res.json(submissions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading submissions", error: error.message });
  }
};
// Update Assessment
exports.updateAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      classes,
      deadline,
      attachments,
      type,
    } = req.body;
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { title, description, subject, classes, deadline, attachments, type },
      { new: true },
    );
    if (!assessment)
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    res.json(assessment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update tugas", error: error.message });
  }
};

// Delete Assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment)
      return res.status(404).json({ message: "Tugas tidak ditemukan" });

    // Optional: Delete related submissions?
    await Submission.deleteMany({ assessment: req.params.id });

    res.json({ message: "Tugas berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal hapus tugas", error: error.message });
  }
};
