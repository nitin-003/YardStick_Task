const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
    default: ''
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  }
}, { timestamps: true });

// Indexes for tenant isolation and performance
noteSchema.index({ tenantId: 1 });
noteSchema.index({ tenantId: 1, isArchived: 1 });
noteSchema.index({ tenantId: 1, createdBy: 1 });
noteSchema.index({ tenantId: 1, priority: 1 });
noteSchema.index({ tenantId: 1, tags: 1 });
noteSchema.index({ tenantId: 1, createdAt: -1 });

// Text search index for search functionality
noteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  category: 'text'
});

// Static methods
noteSchema.statics.findByTenant = function(tenantId, options = {}) {
  const query = { tenantId };
  
  if (options.includeArchived === false) {
    query.isArchived = false;
  }
  
  return this.find(query)
    .populate('createdBy', 'email profile.firstName profile.lastName')
    .sort(options.sortBy ? { [options.sortBy]: options.sortOrder || 'desc' } : { createdAt: -1 });
};

noteSchema.statics.findByTenantAndId = function(tenantId, noteId) {
  return this.findOne({ _id: noteId, tenantId })
    .populate('createdBy', 'email profile.firstName profile.lastName');
};

noteSchema.statics.searchInTenant = function(tenantId, searchTerm) {
  return this.find({
    tenantId,
    $text: { $search: searchTerm }
  }).populate('createdBy', 'email profile.firstName profile.lastName');
};

// Instance methods
noteSchema.methods.belongsToTenant = function(tenantId) {
  return this.tenantId.toString() === tenantId.toString();
};

// Hide sensitive fields
noteSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Note', noteSchema);