const Note = require('../models/Note');
const { asyncHandler } = require('../middlewares/errorHandler');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, priority, category } = req.body;

  const note = new Note({
    title,
    content,
    tags: tags || [],
    priority: priority || 'medium',
    category: category || '',
    tenantId: req.tenant._id,
    createdBy: req.user._id
  });

  await note.save();
  await note.populate('createdBy', 'email profile.firstName profile.lastName');

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: { note }
  });
});

// @desc    Get all notes for the current tenant
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeArchived = false,
    tags,
    priority,
    search
  } = req.query;

  let query = { tenantId: req.tenant._id };

  // Filter by archived status
  if (!includeArchived) {
    query.isArchived = false;
  }

  // Filter by tags
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagArray };
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const notes = await Note.find(query)
    .populate('createdBy', 'email profile.firstName profile.lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Note.countDocuments(query);

  res.json({
    success: true,
    data: {
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get a specific note
// @route   GET /api/notes/:id
// @access  Private
const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findByTenantAndId(req.tenant._id, req.params.id);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  res.json({
    success: true,
    data: { note }
  });
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findByTenantAndId(req.tenant._id, req.params.id);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  // Update fields
  const { title, content, tags, priority, category, isArchived } = req.body;
  
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (priority !== undefined) note.priority = priority;
  if (category !== undefined) note.category = category;
  if (isArchived !== undefined) note.isArchived = isArchived;

  await note.save();
  await note.populate('createdBy', 'email profile.firstName profile.lastName');

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: { note }
  });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findByTenantAndId(req.tenant._id, req.params.id);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  await Note.findByIdAndDelete(note._id);

  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});

// @desc    Archive/Unarchive a note
// @route   PATCH /api/notes/:id/archive
// @access  Private
const toggleArchive = asyncHandler(async (req, res) => {
  const note = await Note.findByTenantAndId(req.tenant._id, req.params.id);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  note.isArchived = !note.isArchived;
  await note.save();
  await note.populate('createdBy', 'email profile.firstName profile.lastName');

  res.json({
    success: true,
    message: `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`,
    data: { note }
  });
});

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  toggleArchive
};