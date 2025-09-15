const Joi = require("joi");

// Wrapper for validation
const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false, // show all errors, not just first
    stripUnknown: true // remove unexpected fields
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details.map(d => d.message),
    });
  }

  // replace request data with cleaned version
  req[source] = value;
  next();
};

// Define schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "A valid email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(100).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
  }),

  invite: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "A valid email is required",
      "any.required": "Email is required",
    }),
    role: Joi.string().valid("admin", "member").default("member"),
  }),

  createNote: Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
      "string.min": "Title is required",
      "string.max": "Title cannot exceed 200 characters",
      "any.required": "Title is required",
    }),
    content: Joi.string().min(1).max(10000).required().messages({
      "string.min": "Content is required",
      "string.max": "Content cannot exceed 10000 characters",
      "any.required": "Content is required",
    }),
    tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
    category: Joi.string().max(100).allow("").default(""),
  }),

  updateNote: Joi.object({
    title: Joi.string().min(1).max(200),
    content: Joi.string().min(1).max(10000),
    tags: Joi.array().items(Joi.string().max(50)).max(10),
    priority: Joi.string().valid("low", "medium", "high"),
    category: Joi.string().max(100).allow(""),
    isArchived: Joi.boolean(),
  }).min(1), // at least 1 field required

  updateProfile: Joi.object({
    firstName: Joi.string().max(50).allow(""),
    lastName: Joi.string().max(50).allow(""),
  }).min(1),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required(),
  }),

  mongoId: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),

  tenantSlug: Joi.object({
    slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(2).max(50).required(),
  }),

  noteQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "title", "priority")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    includeArchived: Joi.boolean().default(false),
    tags: Joi.string(),
    priority: Joi.string().valid("low", "medium", "high"),
    search: Joi.string().max(100),
  }),
};

// Export helpers
module.exports = {
  validate,
  validateLogin: validate(schemas.login),
  validateInvite: validate(schemas.invite),
  validateCreateNote: validate(schemas.createNote),
  validateUpdateNote: validate(schemas.updateNote),
  validateUpdateProfile: validate(schemas.updateProfile),
  validateChangePassword: validate(schemas.changePassword),
  validateMongoId: validate(schemas.mongoId, "params"),
  validateTenantSlug: validate(schemas.tenantSlug, "params"),
  validateNoteQuery: validate(schemas.noteQuery, "query"),
  schemas,
};