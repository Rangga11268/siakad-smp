const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/siakad_smp",
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
      { upsert: true, new: true },
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

    // 3. Seed Simple Test Users
    console.log("\n=== Creating Test Users ===");

    // Admin - Password: admin123
    const adminPassword = await bcrypt.hash("admin123", 10);
    await User.findOneAndUpdate(
      { username: "admin" },
      {
        username: "admin",
        email: "admin@sekolah.id",
        password: adminPassword,
        role: "admin",
        consentGiven: true,
        profile: {
          fullName: "Administrator Sekolah",
          gender: "L",
        },
      },
      { upsert: true, new: true },
    );
    console.log("✅ Admin created - Username: admin | Password: admin123");

    // Guru - Password: guru123
    const guruPassword = await bcrypt.hash("guru123", 10);
    const teacher = await User.findOneAndUpdate(
      { username: "guru" },
      {
        username: "guru",
        email: "guru@sekolah.id",
        password: guruPassword,
        role: "teacher",
        consentGiven: true,
        profile: {
          fullName: "Budi Santoso, S.Pd",
          nip: "198501012010011001",
          gender: "L",
        },
      },
      { upsert: true, new: true },
    );
    console.log("✅ Guru created - Username: guru | Password: guru123");

    // 4. Seed Classes (needed for siswa)
    const Class = require("./models/Class");
    const class7A = await Class.findOneAndUpdate(
      { name: "7A" },
      {
        name: "7A",
        level: 7,
        academicYear: activeYear._id,
        homeroomTeacher: teacher._id,
      },
      { upsert: true, new: true },
    );
    console.log("✅ Class 7A created");

    // Siswa - Password: siswa123
    const siswaPassword = await bcrypt.hash("siswa123", 10);
    const siswa = await User.findOneAndUpdate(
      { username: "siswa" },
      {
        username: "siswa",
        email: "siswa@sekolah.id",
        password: siswaPassword,
        role: "student",
        consentGiven: true,
        profile: {
          fullName: "Ahmad Dani",
          nisn: "0012345678",
          gender: "L",
          class: "7A",
          level: 7,
        },
      },
      { upsert: true, new: true },
    );

    // Link siswa to class
    await Class.findByIdAndUpdate(class7A._id, {
      students: [siswa._id],
    });

    console.log("✅ Siswa created - Username: siswa | Password: siswa123");
    console.log("\n=== User Creation Complete ===\n");

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
        { upsert: true, new: true },
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
        { upsert: true, new: true },
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
