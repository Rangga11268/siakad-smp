const jwt = require("jsonwebtoken");

// Verifikasi Token
exports.auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });

  try {
    // Format: "Bearer <token>"
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
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
