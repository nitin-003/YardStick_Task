const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user/tenant
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId)
      .populate('tenantId')
      .select('-password');

    if (!user || !user.isActive || !user.tenantId?.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user/tenant' });
    }

    req.user = user;
    req.tenant = user.tenantId;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
};

// Require Admin role
const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin()) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Require Member (or Admin as fallback)
const requireMember = (req, res, next) => {
  if (!req.user?.isMember() && !req.user?.isAdmin()) {
    return res.status(403).json({ success: false, message: 'Member access required' });
  }
  next();
};

// Enforce tenant isolation
const enforceTenantIsolation = (req, res, next) => {
  if (!req.tenant) {
    return res.status(403).json({ success: false, message: 'Tenant context required' });
  }
  req.tenantFilter = { tenantId: req.tenant._id };
  next();
};

// Check subscription limits (Free = 3 notes, Pro = unlimited)
const checkSubscriptionLimits = () => async (req, res, next) => {
  try {
    if (!(await req.tenant.canCreateNote())) {
      return res.status(403).json({
        success: false,
        message: 'Note limit reached. Upgrade to Pro for unlimited notes.'
      });
    }
    next();
  } catch (err) {
    console.error('Subscription check error:', err.message);
    res.status(500).json({ success: false, message: 'Subscription check failed' });
  }
};

module.exports = {
  protect: verifyToken,
  verifyToken,
  requireAdmin,
  requireMember,
  enforceTenantIsolation,
  checkSubscriptionLimits
};