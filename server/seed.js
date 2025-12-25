const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/siakad_smp"
    );
    console.log("MongoDB Connected for Seeding");

    // 1. Seed Academic Year
    const AcademicYear = require("./models/AcademicYear");
    const activeYear = await AcademicYear.findOneAndUpdate(
      { name: "2024/2025", semester: "Ganjil" },
      {
        name: "2024/2025",
        semester: "Ganjil",
        status: "active",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2024-12-31"),
      },
      { upsert: true, new: true }
    );
    console.log("Academic Year Seeded");

    // 2. Seed Subjects
    const Subject = require("./models/Subject");
    const subjectsList = [
      { name: "Matematika", code: "MAT", kkm: 75 },
      { name: "Bahasa Indonesia", code: "IND", kkm: 75 },
      { name: "IPA", code: "IPA", kkm: 70 },
      { name: "Bahasa Inggris", code: "ING", kkm: 72 },
      { name: "Pendidikan Agama Islam", code: "PAI", kkm: 75 },
    ];
    const createdSubjects = [];
    for (const s of subjectsList) {
      const subj = await Subject.findOneAndUpdate({ code: s.code }, s, {
        upsert: true,
        new: true,
      });
      createdSubjects.push(subj);
    }
    console.log("Subjects Seeded");

    // 3. Seed Users (Admin, Teacher, Students)
    // Create Teacher first to assign as homeroom
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Teacher
    const teacher = await User.findOneAndUpdate(
      { username: "guru" },
      {
        username: "guru",
        email: "guru@sekolah.id",
        password: hashedPassword,
        role: "teacher",
        consentGiven: true,
        profile: {
          fullName: "Budi Santoso, S.Pd",
          nip: "198501012010011001",
          gender: "L",
        },
      },
      { upsert: true, new: true }
    );

    // Admin
    await User.findOneAndUpdate(
      { username: "admin" },
      {
        username: "admin",
        email: "admin@sekolah.id",
        password: hashedPassword,
        role: "admin",
        consentGiven: true,
        profile: { fullName: "Administrator Sekolah", nip: "999" },
      },
      { upsert: true, new: true }
    );

    // 4. Seed Classes
    const Class = require("./models/Class");
    const class7A = await Class.findOneAndUpdate(
      { name: "7A" },
      {
        name: "7A",
        level: 7,
        academicYear: activeYear._id,
        homeroomTeacher: teacher._id,
      },
      { upsert: true, new: true }
    );
    const class8A = await Class.findOneAndUpdate(
      { name: "8A" },
      {
        name: "8A",
        level: 8,
        academicYear: activeYear._id,
        homeroomTeacher: teacher._id,
      },
      { upsert: true, new: true }
    );
    console.log("Classes Seeded");

    // 5. Seed Students and link to Class 7A
    const studentData = [
      {
        username: "siswa1",
        fullName: "Ahmad Dani",
        nisn: "0012345678",
        gender: "L",
      },
      {
        username: "siswa2",
        fullName: "Bunga Citra",
        nisn: "0012345679",
        gender: "P",
      },
      {
        username: "siswa3",
        fullName: "Candra Wijaya",
        nisn: "0012345670",
        gender: "L",
      },
    ];

    const studentIds = [];

    for (const s of studentData) {
      const user = await User.findOneAndUpdate(
        { username: s.username },
        {
          username: s.username,
          email: `${s.username}@sekolah.id`,
          password: hashedPassword,
          role: "student",
          consentGiven: true,
          profile: {
            fullName: s.fullName,
            nisn: s.nisn,
            gender: s.gender,
            class: "7A", // Text reference
            level: 7,
          },
        },
        { upsert: true, new: true }
      );
      studentIds.push(user._id);
    }

    // Update Class with students array (if schema has it, my Class model might need update or seed just links it)
    // Note: My Class model earlier didn't explicitly show students array but controller used it.
    // Usually it's better to store reference in Class or rely on User profile.class.
    // AcademicController `getStudentsByLevel` relies on `Class.find().populate('students')`?
    // Let's check Schema one sec (from memory, I don't recall linking).
    // Actually `Class` usually has `students` array or we search `User` by class.
    // I'll update Class to hav students array just in case.
    await Class.findByIdAndUpdate(class7A._id, { students: studentIds });

    console.log("Students Seeded & Linked to 7A");

    // 6. Seed Learning Goals (TP)
    const LearningGoal = require("./models/LearningGoal");
    const matSubject = createdSubjects.find((s) => s.code === "MAT");

    if (matSubject) {
      await LearningGoal.findOneAndUpdate(
        { code: "TP.7.1" },
        {
          subject: matSubject._id,
          academicYear: activeYear._id,
          level: 7,
          code: "TP.7.1",
          description:
            "Peserta didik dapat membaca, menulis, dan membandingkan bilangan bulat.",
          semester: "Ganjil",
        },
        { upsert: true, new: true }
      );
      await LearningGoal.findOneAndUpdate(
        { code: "TP.7.2" },
        {
          subject: matSubject._id,
          academicYear: activeYear._id,
          level: 7,
          code: "TP.7.2",
          description:
            "Peserta didik dapat menyelesaikan masalah operasi hitung bilangan bulat.",
          semester: "Ganjil",
        },
        { upsert: true, new: true }
      );
    }
    console.log("Learning Goals Seeded");

    console.log("Seeding Completed Successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedData();
