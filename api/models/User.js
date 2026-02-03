const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },

    // Homeroom Teacher (Wali Kelas) fields
    isHomeroomTeacher: { type: Boolean, default: false },
    homeroomClass: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // UU PDP Compliance
    consentGiven: { type: Boolean, default: false }, // Checkbox saat login pertama
    consentDate: { type: Date },

    // Profile Data (Mixed for flexibility, encrypted fields should be handled in Logic)
    profile: {
      fullName: { type: String, required: true },
      nik: { type: String }, // Sensitive
      nisn: { type: String }, // Student only
      nip: { type: String }, // Teacher only
      subject: { type: String }, // Teacher only (Mapel Ampu)
      phone: { type: String },
      address: { type: String },
      gender: { type: String, enum: ["L", "P"] },
      birthPlace: String,
      birthDate: Date,
      avatar: String, // URL

      class: String, // Added class string

      // Data Fisik & Kesehatan
      physical: {
        height: Number, // cm
        weight: Number, // kg
        headCircumference: Number, // cm
        bloodType: String,
      },

      // Data Keluarga & Sosio-Ekonomi
      family: {
        fatherName: String,
        motherName: String,
        guardianName: String,
        parentJob: String, // PNS, Wiraswasta, Buruh, dll
        parentIncome: String, // Range: < 1 Juta, 1-3 Juta, dll
        kipStatus: { type: Boolean, default: false },
        kipNumber: String,
      },

      // Riwayat Mutasi
      mutations: [
        {
          type: { type: String, enum: ["Masuk", "Keluar", "Pindah", "Lulus"] },
          date: Date,
          reason: String,
          schoolName: String, // Asal atau Tujuan
        },
      ],
    },

    // Parent specific relations
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
