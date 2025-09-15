const express = require("express");
const { validateTenantSlug } = require("../middlewares/validation");
const { getTenantInfo, upgradeTenant, getTenantStats } = require("../controllers/tenantController");
const { protect, requireAdmin } = require("../middlewares/auth");

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// GET /api/tenants/:slug - Get tenant information
router.get("/:slug", validateTenantSlug, getTenantInfo);

// POST /api/tenants/:slug/upgrade - Upgrade tenant to Pro (Admin only)
router.post("/:slug/upgrade", validateTenantSlug, requireAdmin, upgradeTenant);

// GET /api/tenants/:slug/stats - Get tenant statistics (Admin only)
router.get("/:slug/stats", validateTenantSlug, requireAdmin, getTenantStats);

module.exports = router;