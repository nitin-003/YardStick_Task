const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Tenant name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Tenant slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    minlength: [2, 'Slug must be at least 2 characters'],
    maxlength: [50, 'Slug cannot exceed 50 characters']
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Indexes
tenantSchema.index({ slug: 1 });
tenantSchema.index({ isActive: 1 });

// Methods
tenantSchema.methods.canCreateNote = async function() {
  if (this.subscription === 'pro') return true;
  
  const Note = mongoose.model('Note');
  const noteCount = await Note.countDocuments({ tenantId: this._id });
  return noteCount < 3;
};

tenantSchema.methods.getNoteCount = async function() {
  const Note = mongoose.model('Note');
  return await Note.countDocuments({ tenantId: this._id });
};

// Static methods
tenantSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Hide sensitive fields
tenantSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Tenant', tenantSchema);