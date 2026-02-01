const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (Admin use primarily, or initial setup)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, profile, consentGiven } = req.body;

    // Cek user existing
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "User sudah terdaftar" });

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      profile,
      consentGiven, // Penting untuk UU PDP
      consentDate: consentGiven ? new Date() : null,
    });

    await newUser.save();

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login Attempt:", username);

    // Cari user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    let userData = {
      id: user._id,
      username: user.username,
      role: user.role,
      profile: user.profile,
      consentGiven: user.consentGiven,
    };

    if (user.role === "parent") {
      const fullUser = await User.findById(user._id).populate(
        "children",
        "username profile",
      );
      userData.children = fullUser.children;
    }

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get Current User (Me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Auto-Heal: If student has no class in profile, check if they are in a Class document
    if (user.role === "student" && (!user.profile || !user.profile.class)) {
      const ClassModel = require("../models/Class");
      // Find class that contains this student
      const foundClass = await ClassModel.findOne({ students: user._id });

      if (foundClass) {
        console.log(
          `[Auto-Heal] Syncing class for student ${user.username}: ${foundClass.name}`,
        );
        if (!user.profile) user.profile = {};
        user.profile.class = foundClass.name;
        await user.save();
      }
    }

    // Populate children if parent
    if (user.role === "parent") {
      await user.populate("children", "username profile");
    }

    res.json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res
      .status(500)
      .json({ message: "Gagal ambil data user", error: error.message });
  }
};

// Update User (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, profile } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Update Basic Info
    if (username) user.username = username;
    if (email !== undefined) user.email = email; // Allow clearing email?
    if (role) user.role = role;

    // Password Update if provided
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    // Profile Update (Merge)
    if (profile) {
      // Ensure profile object exists
      if (!user.profile) user.profile = {};
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      message: "User berhasil diperbarui",
      user: sanitizeUserResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username atau Email sudah digunakan" });
    }
    res
      .status(500)
      .json({ message: "Gagal update user", error: error.message });
  }
};

// Delete User (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus user", error: error.message });
  }
};

// User Self-Update (Restricted)
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { profile, password, email } = req.body;

    // 1. Handle Password Change
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    // 2. Handle Email Change
    if (email && email !== user.email) {
      // Simple check if email is taken (optional but good)
      // const existing = await User.findOne({ email });
      // if (existing) return res.status(400).json({ message: "Email sudah digunakan" });
      user.email = email;
    }

    // 2. Handle Profile Update (Whitelisted Fields Only)
    if (profile) {
      if (!user.profile) user.profile = {};

      // Common fields allowed for everyone
      const allowedCommon = ["address", "phone", "bio", "avatar"];
      allowedCommon.forEach((field) => {
        if (profile[field] !== undefined) user.profile[field] = profile[field];
      });

      // Role-specific allowed fields
      if (user.role === "student") {
        const allowedStudent = ["birthPlace", "birthDate"]; // Maybe allow fixing birth data?
        // Family data is nested, handle carefully or let it be replaced if structure matches
        if (profile.family) {
          user.profile.family = {
            ...user.profile.family,
            ...profile.family,
          };
        }
        // Physical data
        if (profile.physical) {
          user.profile.physical = {
            ...user.profile.physical,
            ...profile.physical,
          };
        }

        allowedStudent.forEach((field) => {
          if (profile[field] !== undefined)
            user.profile[field] = profile[field];
        });
      }

      if (user.role === "teacher") {
        const allowedTeacher = ["title", "education"];
        allowedTeacher.forEach((field) => {
          if (profile[field] !== undefined)
            user.profile[field] = profile[field];
        });
      }

      // Explicitly protect sensitive fields
      // user.profile.fullName = DO NOT UPDATE (Admin only)
      // user.profile.nisn = DO NOT UPDATE
      // user.profile.class = DO NOT UPDATE
    }

    await user.save();

    // Return updated user data (sanitize!)
    const userData = {
      id: user._id,
      username: user.username,
      role: user.role,
      profile: user.profile,
    };

    res.json({ message: "Profil berhasil diperbarui", user: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update profil", error: error.message });
  }
};

// Helper reuse
const sanitizeUserResponse = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile,
    isActive: user.isActive,
  };
};
