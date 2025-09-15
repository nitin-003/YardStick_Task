const express = require("express");
const { validateLogin, validateInvite, validateUpdateProfile, validateChangePassword } = require("../middlewares/validation");
const { login, getMe, inviteUser, updateProfile, changePassword } = require("../controllers/authController");
const { protect, requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", validateLogin, login);

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/invite (Admin only)
router.post("/invite", protect, requireAdmin, validateInvite, inviteUser);

// PUT /api/auth/profile
router.put("/profile", protect, validateUpdateProfile, updateProfile);

// PUT /api/auth/change-password
router.put("/change-password", protect, validateChangePassword, changePassword);

module.exports = router;

