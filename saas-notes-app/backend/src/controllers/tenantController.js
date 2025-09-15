const Tenant = require('../models/Tenant');
const Note = require('../models/Note');
const { asyncHandler } = require('../middlewares/errorHandler');

// @desc    Get tenant information
// @route   GET /api/tenants/:slug
// @access  Private
const getTenantInfo = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findBySlug(req.params.slug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  // Get note count
  const noteCount = await tenant.getNoteCount();

  res.json({
    success: true,
    data: {
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        noteCount,
        noteLimit: tenant.subscription === 'pro' ? 'unlimited' : 3,
        canCreateNote: await tenant.canCreateNote()
      }
    }
  });
});

// @desc    Upgrade tenant subscription to Pro
// @route   POST /api/tenants/:slug/upgrade
// @access  Private/Admin
const upgradeTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findBySlug(req.params.slug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  // Check if user belongs to this tenant
  if (req.tenant._id.toString() !== tenant._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (tenant.subscription === 'pro') {
    return res.status(400).json({ success: false, message: 'Tenant is already on Pro plan' });
  }

  tenant.subscription = 'pro';
  await tenant.save();

  // Get updated note count
  const noteCount = await tenant.getNoteCount();

  res.json({
    success: true,
    message: 'Tenant upgraded to Pro successfully',
    data: {
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
        noteCount,
        noteLimit: 'unlimited',
        canCreateNote: true
      }
    }
  });
});

// @desc    Get tenant statistics
// @route   GET /api/tenants/:slug/stats
// @access  Private/Admin
const getTenantStats = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findBySlug(req.params.slug);

  if (!tenant) {
    return res.status(404).json({ success: false, message: 'Tenant not found' });
  }

  // Check if user belongs to this tenant
  if (req.tenant._id.toString() !== tenant._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const noteCount = await tenant.getNoteCount();
  const notesByPriority = await Note.aggregate([
    { $match: { tenantId: tenant._id } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  const notesByCategory = await Note.aggregate([
    { $match: { tenantId: tenant._id, category: { $ne: '' } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalNotes: noteCount,
        notesByPriority,
        notesByCategory,
        subscription: tenant.subscription,
        noteLimit: tenant.subscription === 'pro' ? 'unlimited' : 3,
        canCreateNote: await tenant.canCreateNote()
      }
    }
  });
});

module.exports = {
  getTenantInfo,
  upgradeTenant,
  getTenantStats
};