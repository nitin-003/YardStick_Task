const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Invalid email format'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profile: {
    firstName: { type: String, trim: true, maxlength: 50, default: '' },
    lastName: { type: String, trim: true, maxlength: 50, default: '' }
  }
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ tenantId: 1 });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ email: 1, tenantId: 1 });

// Pre-save hook: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Methods: role check
userSchema.methods.isAdmin = function () { return this.role === 'admin'; };
userSchema.methods.isMember = function () { return this.role === 'member'; };

// Method: update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Method: get full name or fallback to email prefix
userSchema.methods.getFullName = function () {
  if (this.profile.firstName || this.profile.lastName) {
    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
  }
  return this.email.split('@')[0];
};

// Static: find active user by email & tenant
userSchema.statics.findByEmailAndTenant = function (email, tenantId) {
  return this.findOne({ email, tenantId, isActive: true });
};

// Static: find active users in tenant
userSchema.statics.findActiveInTenant = function (tenantId) {
  return this.find({ tenantId, isActive: true }).select('-password');
};

// Hide password in JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);