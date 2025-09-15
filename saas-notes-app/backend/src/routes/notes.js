const express = require("express");
const { 
  validateCreateNote, 
  validateUpdateNote, 
  validateMongoId, 
  validateNoteQuery 
} = require("../middlewares/validation");
const { 
  createNote, 
  getNotes, 
  getNote, 
  updateNote, 
  deleteNote, 
  toggleArchive 
} = require("../controllers/notesController");
const { 
  protect, 
  enforceTenantIsolation, 
  checkSubscriptionLimits 
} = require("../middlewares/auth");

const router = express.Router();

// Apply authentication and tenant isolation to all routes
router.use(protect);
router.use(enforceTenantIsolation);

// POST /api/notes - Create a note
router.post("/", validateCreateNote, checkSubscriptionLimits(), createNote);

// GET /api/notes - Get all notes for current tenant
router.get("/", validateNoteQuery, getNotes);

// GET /api/notes/:id - Get a specific note
router.get("/:id", validateMongoId, getNote);

// PUT /api/notes/:id - Update a note
router.put("/:id", validateMongoId, validateUpdateNote, updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete("/:id", validateMongoId, deleteNote);

// PATCH /api/notes/:id/archive - Archive/Unarchive a note
router.patch("/:id/archive", validateMongoId, toggleArchive);

module.exports = router;