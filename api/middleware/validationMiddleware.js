const Joi = require("joi");

// Helper for Indonesian messages
const m = {
  "any.required": "{#label} wajib diisi",
  "string.base": "{#label} harus berupa teks",
  "string.empty": "{#label} tidak boleh kosong",
  "string.min": "{#label} minimal {#limit} karakter",
  "string.max": "{#label} maksimal {#limit} karakter",
  "string.alphanum": "{#label} format salah (hanya huruf dan angka)",
  "string.email": "{#label} format email tidak valid",
  "string.length": "{#label} harus {#limit} karakter",
  "number.base": "{#label} harus berupa angka",
  "number.min": "{#label} minimal {#limit}",
  "number.max": "{#label} maksimal {#limit}",
  "date.base": "{#label} format tanggal tidak valid",
  "any.only": "{#label} harus salah satu dari: {#valids}",
};

// Validation schemas
const schemas = {
  // Student registration
  createStudent: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .label("Username")
      .messages(m),
    password: Joi.string()
      .min(6)
      .max(100)
      .optional()
      .allow("")
      .label("Password")
      .messages(m),
    fullName: Joi.string()
      .min(3)
      .max(100)
      .required()
      .label("Nama Lengkap")
      .messages(m),
    nisn: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required()
      .label("NISN")
      .messages({ ...m, "string.pattern.base": "NISN harus berupa angka" }),
    gender: Joi.string()
      .valid("L", "P")
      .required()
      .label("Jenis Kelamin")
      .messages(m),
    level: Joi.string()
      .valid("7", "8", "9")
      .required()
      .label("Tingkat")
      .messages(m),
    className: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label("Kelas")
      .messages(m),
    birthPlace: Joi.string()
      .max(100)
      .optional()
      .allow("")
      .label("Tempat Lahir")
      .messages(m),
    birthDate: Joi.date()
      .optional()
      .allow("")
      .label("Tanggal Lahir")
      .messages(m),
    address: Joi.string()
      .max(500)
      .optional()
      .allow("")
      .label("Alamat")
      .messages(m),
    physical: Joi.object({
      height: Joi.number()
        .min(0)
        .max(300)
        .optional()
        .label("Tinggi Badan")
        .messages(m),
      weight: Joi.number()
        .min(0)
        .max(300)
        .optional()
        .label("Berat Badan")
        .messages(m),
      headCircumference: Joi.number()
        .min(0)
        .max(100)
        .optional()
        .label("Lingkar Kepala")
        .messages(m),
      bloodType: Joi.string()
        .valid("-", "A", "B", "AB", "O")
        .optional()
        .allow("")
        .label("Golongan Darah")
        .messages(m),
    }).optional(),
    family: Joi.object({
      fatherName: Joi.string()
        .max(100)
        .optional()
        .allow("")
        .label("Nama Ayah")
        .messages(m),
      motherName: Joi.string()
        .max(100)
        .optional()
        .allow("")
        .label("Nama Ibu")
        .messages(m),
      guardianName: Joi.string()
        .max(100)
        .optional()
        .allow("")
        .label("Nama Wali")
        .messages(m),
      parentJob: Joi.string()
        .max(100)
        .optional()
        .allow("")
        .label("Pekerjaan Orang Tua")
        .messages(m),
      parentIncome: Joi.string()
        .max(50)
        .optional()
        .allow("")
        .label("Penghasilan Orang Tua")
        .messages(m),
      kipStatus: Joi.boolean().optional().label("Status KIP").messages(m),
      kipNumber: Joi.string()
        .max(50)
        .optional()
        .allow("")
        .label("No KIP")
        .messages(m),
    }).optional(),
  }),

  // PPDB Registration
  ppdbRegistration: Joi.object({
    nisn: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required()
      .label("NISN")
      .messages({ ...m, "string.pattern.base": "NISN harus berupa angka" }),
    fullname: Joi.string()
      .min(3)
      .max(100)
      .required()
      .label("Nama Lengkap")
      .messages(m),
    gender: Joi.string()
      .valid("L", "P")
      .required()
      .label("Jenis Kelamin")
      .messages(m),
    birthPlace: Joi.string()
      .max(100)
      .required()
      .label("Tempat Lahir")
      .messages(m),
    birthDate: Joi.date().required().label("Tanggal Lahir").messages(m),
    address: Joi.string().max(500).required().label("Alamat").messages(m),
    parentPhone: Joi.string()
      .pattern(/^[0-9+\-() ]+$/)
      .max(20)
      .required()
      .label("No HP Orang Tua")
      .messages(m),
    parentName: Joi.string()
      .max(100)
      .required()
      .label("Nama Orang Tua")
      .messages(m),
    originSchool: Joi.string()
      .max(200)
      .required()
      .label("Asal Sekolah")
      .messages(m),
    registrationPath: Joi.string()
      .valid("Zonasi", "Afirmasi", "Prestasi", "Pindah Tugas")
      .required()
      .label("Jalur Pendaftaran")
      .messages(m),
  }),

  // Login
  login: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .label("Username")
      .messages(m),
    password: Joi.string().min(1).required().label("Password").messages(m),
  }),

  // Billing generation
  generateBilling: Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required()
      .label("Judul Tagihan")
      .messages(m),
    amount: Joi.number().min(0).required().label("Nominal").messages(m),
    dueDate: Joi.date().required().label("Jatuh Tempo").messages(m),
    type: Joi.string()
      .valid("SPP", "Gedung", "Seragam", "Lainnya")
      .required()
      .label("Tipe Tagihan")
      .messages(m),
    targetClass: Joi.string()
      .max(10)
      .optional()
      .allow("")
      .label("Kelas Target")
      .messages(m),
  }),

  // Generic Registration (Teacher/Admin)
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .label("Username")
      .messages(m),
    password: Joi.string()
      .min(6)
      .max(100)
      .required()
      .label("Password")
      .messages(m),
    email: Joi.string().email().optional().allow("").label("Email").messages(m),
    role: Joi.string()
      .valid("admin", "teacher", "student", "parent")
      .required()
      .label("Role")
      .messages(m),
    profile: Joi.object({
      nip: Joi.string()
        .pattern(/^[0-9]*$/)
        .optional()
        .allow("")
        .label("NIP")
        .messages({ ...m, "string.pattern.base": "NIP harus berupa angka" }),
      fullName: Joi.string().required().label("Nama Lengkap").messages(m),
    })
      .unknown(true)
      .optional(),
    consentGiven: Joi.boolean().optional(),
  }),

  // Update User (Admin)
  updateUser: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .optional()
      .label("Username")
      .messages(m),
    password: Joi.string()
      .min(6)
      .max(100)
      .optional()
      .allow("")
      .label("Password")
      .messages(m),
    email: Joi.string().email().optional().allow("").label("Email").messages(m),
    role: Joi.string()
      .valid("admin", "teacher", "student", "parent")
      .optional()
      .label("Role")
      .messages(m),
    profile: Joi.object({
      nip: Joi.string()
        .pattern(/^[0-9]*$/)
        .optional()
        .allow("")
        .label("NIP")
        .messages({ ...m, "string.pattern.base": "NIP harus berupa angka" }),
      fullName: Joi.string().optional().label("Nama Lengkap").messages(m),
      phone: Joi.string().optional().allow("").label("No HP").messages(m),
      subject: Joi.string().optional().allow("").label("Mapel").messages(m),
      gender: Joi.string().optional().label("Jenis Kelamin").messages(m),
      address: Joi.string().optional().allow("").label("Alamat").messages(m),
    })
      .unknown(true)
      .optional(),
    consentGiven: Joi.boolean().optional(),
  }),

  // New: Subject Validation
  createSubject: Joi.object({
    code: Joi.string()
      .min(2)
      .max(10)
      .required()
      .label("Kode Mapel")
      .messages(m),
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .label("Nama Mapel")
      .messages(m),
    level: Joi.number()
      .valid(7, 8, 9)
      .required()
      .label("Tingkat Kelas")
      .messages(m),
    kktpType: Joi.string().optional().label("Jenis KKTP").messages(m),
  }),

  // New: Class Validation
  createClass: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .label("Nama Kelas")
      .messages(m),
    level: Joi.number()
      .valid(7, 8, 9)
      .required()
      .label("Tingkat Kelas")
      .messages(m),
    academicYear: Joi.string().required().label("Tahun Ajaran").messages(m),
    homeroomTeacher: Joi.string()
      .optional()
      .allow("")
      .label("Wali Kelas")
      .messages(m),
  }),
};

// Middleware function
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ message: "Validation schema not found" });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join("; ");
      return res.status(400).json({
        message: "Data tidak valid",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
