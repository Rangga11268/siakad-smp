const jwt = require("jsonwebtoken");

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
  console.error(
    "❌ FATAL: JWT_SECRET is not defined in environment variables!",
  );
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// Verifikasi Token
exports.auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });

  try {
    // Format: "Bearer <token>"
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token tidak valid" });
  }
};

// Cek Role (RBAC)
exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Akses ditolak, role tidak sesuai" });
  }
  next();
};
