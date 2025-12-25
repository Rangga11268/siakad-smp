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

    // UU PDP Compliance
    consentGiven: { type: Boolean, default: false }, // Checkbox saat login pertama
    consentDate: { type: Date },

    // Profile Data (Mixed for flexibility, encrypted fields should be handled in Logic)
    profile: {
      fullName: { type: String, required: true },
      nik: { type: String }, // Sensitive
      nisn: { type: String }, // Student only
      nip: { type: String }, // Teacher only
      phone: { type: String },
      address: { type: String },
      gender: { type: String, enum: ["L", "P"] },
      birthPlace: String,
      birthDate: Date,
      avatar: String, // URL
    },

    // Parent specific relations
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    timestamps: true,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
