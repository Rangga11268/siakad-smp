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
    const assessment = new Assessment({
      title,
      description,
      subject,
      classes,
      teacher: req.user.id, // from auth middleware
      deadline,
      attachments,
      type,
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
      // Future student logic
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
    const { text, files } = req.body;
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
