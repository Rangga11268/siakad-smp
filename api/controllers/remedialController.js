const Remedial = require("../models/Remedial");
const Grade = require("../models/Grade");
const Assessment = require("../models/Assessment");
const User = require("../models/User");
const AcademicYear = require("../models/AcademicYear");

// 1. Get Eligible Students for Remedial (Grades < KKM)
exports.getEligibleStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subjectId, classId, kkm = 75 } = req.query;

    const activeYear = await AcademicYear.findOne({ status: "active" });
    if (!activeYear) {
      return res
        .status(400)
        .json({ message: "No active academic year found." });
    }

    // Find assessments by this teacher
    const assessmentFilter = {
      teacher: teacherId,
      academicYear: activeYear._id,
    };
    if (subjectId) assessmentFilter.subject = subjectId;
    if (classId) assessmentFilter.classes = classId;

    const myAssessments =
      await Assessment.find(assessmentFilter).select("_id title subject");
    const assessmentIds = myAssessments.map((a) => a._id);

    // Find grades below KKM
    const lowGrades = await Grade.find({
      assessment: { $in: assessmentIds },
      score: { $lt: parseInt(kkm) },
    })
      .populate("student", "profile.fullName profile.class")
      .populate({
        path: "assessment",
        select: "title subject",
        populate: { path: "subject", select: "name" },
      });

    // Also find existing remedial assignments to filter out duplicates or show status
    const existingRemedials = await Remedial.find({
      assessment: { $in: assessmentIds },
    });

    const eligibleList = lowGrades.map((grade) => {
      const existing = existingRemedials.find(
        (r) =>
          r.student.toString() === grade.student._id.toString() &&
          r.assessment.toString() === grade.assessment._id.toString(),
      );

      return {
        _id: grade._id, // Grade ID
        studentId: grade.student._id,
        studentName: grade.student.profile.fullName,
        className: grade.student.profile.class,
        assessmentId: grade.assessment._id,
        assessmentTitle: grade.assessment.title,
        subjectId: grade.assessment.subject._id,
        subjectName: grade.assessment.subject.name,
        originalScore: grade.score,
        kkm: parseInt(kkm),
        remedialStatus: existing ? existing.status : "not_assigned",
        remedialId: existing ? existing._id : null,
      };
    });

    res.json(eligibleList);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch eligible students",
        error: error.message,
      });
  }
};

// 2. Assign Remedial Task to Student
exports.assignRemedial = async (req, res) => {
  try {
    const {
      studentId,
      assessmentId,
      originalScore,
      subjectId,
      taskDescription,
    } = req.body;

    const activeYear = await AcademicYear.findOne({ status: "active" });

    // Check if already assigned
    const existing = await Remedial.findOne({
      student: studentId,
      assessment: assessmentId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Remedial already assigned for this assessment." });
    }

    const newRemedial = new Remedial({
      student: studentId,
      assessment: assessmentId,
      subject: subjectId,
      academicYear: activeYear._id,
      originalScore: originalScore,
      taskDescription: taskDescription,
      status: "assigned",
    });

    await newRemedial.save();
    res
      .status(201)
      .json({ message: "Remedial assigned successfully", data: newRemedial });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to assign remedial", error: error.message });
  }
};

// 3. Submit Remedial Score
exports.submitRemedialScore = async (req, res) => {
  try {
    const { id } = req.params; // Remedial ID
    const { remedialScore, feedback, kkm = 75 } = req.body;

    const remedial = await Remedial.findById(id);
    if (!remedial) {
      return res.status(404).json({ message: "Remedial record not found." });
    }

    // Usually remedial scores are capped at KKM
    const finalScore = Math.min(remedialScore, kkm);

    remedial.remedialScore = finalScore;
    remedial.feedback = feedback;
    remedial.status = "completed";
    await remedial.save();

    // Optionally update the original Grade record (or keep them separate for history)
    // We will update the main grade to reflect the passing status, but keep originalScore in Remedial model
    const grade = await Grade.findOne({
      student: remedial.student,
      assessment: remedial.assessment,
    });
    if (grade) {
      // Mark somewhere in grade that it was a remedial pass?
      // For now, just update the score
      grade.score = finalScore;
      await grade.save();
    }

    res.json({
      message: "Remedial score submitted successfully",
      data: remedial,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to submit remedial score",
        error: error.message,
      });
  }
};
