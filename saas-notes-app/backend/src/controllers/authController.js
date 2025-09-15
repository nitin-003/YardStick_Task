const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middlewares/errorHandler');

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
  return jwt.sign({ userId }, secret, { expiresIn: '24h' });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include tenant
  const user = await User.findOne({ email, isActive: true }).populate('tenantId');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.tenantId || !user.tenantId.isActive) {
    return res.status(401).json({ success: false, message: 'Account suspended' });
  }

  await user.updateLastLogin();
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        subscription: user.tenantId.subscription
      }
    },
    token
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        lastLogin: req.user.lastLogin,
        tenant: {
          id: req.tenant._id,
          name: req.tenant.name,
          slug: req.tenant.slug,
          subscription: req.tenant.subscription
        }
      }
    }
  });
});

// @desc    Invite user (Admin only)
// @route   POST /api/auth/invite
// @access  Private/Admin
const inviteUser = asyncHandler(async (req, res) => {
  const { email, role = 'member' } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const newUser = new User({
    email,
    password: 'password', // default password
    role,
    tenantId: req.tenant._id
  });
  await newUser.save();

  res.status(201).json({
    success: true,
    message: 'User invited successfully',
    data: {
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        tenant: {
          id: req.tenant._id,
          name: req.tenant.name,
          slug: req.tenant.slug
        }
      }
    }
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  const user = await User.findById(req.user._id);

  if (firstName !== undefined) user.profile.firstName = firstName;
  if (lastName !== undefined) user.profile.lastName = lastName;
  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        tenant: {
          id: req.tenant._id,
          name: req.tenant.name,
          slug: req.tenant.slug
        }
      }
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = {
  login,
  getMe,
  inviteUser,
  updateProfile,
  changePassword
};