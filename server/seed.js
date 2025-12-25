const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/siakad_smp"
    );
    console.log("MongoDB Connected for Seeding");

    const users = [
      {
        username: "admin",
        email: "admin@sekolah.id",
        password: "password123",
        role: "admin",
        consentGiven: true,
        profile: {
          fullName: "Administrator Sekolah",
          nip: "999999999",
        },
      },
      {
        username: "guru",
        email: "guru@sekolah.id",
        password: "password123",
        role: "teacher",
        consentGiven: true,
        profile: {
          fullName: "Budi Santoso, S.Pd",
          nip: "198501012010011001",
          gender: "L",
        },
      },
      {
        username: "siswa",
        email: "siswa@sekolah.id",
        password: "password123",
        role: "student",
        consentGiven: true,
        profile: {
          fullName: "Ahmad Dani",
          nisn: "0012345678",
          gender: "L",
        },
      },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.findOneAndUpdate(
        { username: user.username },
        { ...user, password: hashedPassword },
        { upsert: true, new: true }
      );
      console.log(`User ${user.username} seeded/updated`);
    }

    console.log("Seeding Completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedUsers();
