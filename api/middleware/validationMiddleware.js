const Joi = require("joi");

// Validation schemas
const schemas = {
  // Student registration
  createStudent: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).optional(),
    fullName: Joi.string().min(3).max(100).required(),
    nisn: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    gender: Joi.string().valid("L", "P").required(),
    level: Joi.string().valid("7", "8", "9").required(),
    className: Joi.string().min(2).max(10).required(),
    birthPlace: Joi.string().max(100).optional(),
    birthDate: Joi.date().optional(),
    address: Joi.string().max(500).optional(),
    physical: Joi.object({
      height: Joi.number().min(0).max(300).optional(),
      weight: Joi.number().min(0).max(300).optional(),
      headCircumference: Joi.number().min(0).max(100).optional(),
      bloodType: Joi.string().valid("-", "A", "B", "AB", "O").optional(),
    }).optional(),
    family: Joi.object({
      fatherName: Joi.string().max(100).optional(),
      motherName: Joi.string().max(100).optional(),
      guardianName: Joi.string().max(100).optional(),
      parentJob: Joi.string().max(100).optional(),
      parentIncome: Joi.string().max(50).optional(),
      kipStatus: Joi.boolean().optional(),
      kipNumber: Joi.string().max(50).optional(),
    }).optional(),
  }),

  // PPDB Registration
  ppdbRegistration: Joi.object({
    nisn: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    fullname: Joi.string().min(3).max(100).required(),
    gender: Joi.string().valid("L", "P").required(),
    birthPlace: Joi.string().max(100).required(),
    birthDate: Joi.date().required(),
    address: Joi.string().max(500).required(),
    phone: Joi.string()
      .pattern(/^[0-9+\-() ]+$/)
      .max(20)
      .required(),
    parentName: Joi.string().max(100).required(),
    previousSchool: Joi.string().max(200).optional(),
  }),

  // Login
  login: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(1).required(),
  }),

  // Billing generation
  generateBilling: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    amount: Joi.number().min(0).required(),
    dueDate: Joi.date().required(),
    type: Joi.string().valid("SPP", "Gedung", "Seragam", "Lainnya").required(),
    targetClass: Joi.string().max(10).optional().allow(""),
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
