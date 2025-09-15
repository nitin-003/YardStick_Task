import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notesAPI, tenantsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Archive, 
  Crown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    priority: 'medium',
    category: ''
  });

  useEffect(() => {
    fetchNotes();
    fetchTenantInfo();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAll();
      setNotes(response.data.notes || []);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantInfo = async () => {
    try {
      const response = await tenantsAPI.getInfo(user.tenant.slug);
      setTenantInfo(response.data.tenant);
    } catch (error) {
      console.error('Failed to fetch tenant info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (editingNote) {
        await notesAPI.update(editingNote._id, noteData);
        toast.success('Note updated successfully');
      } else {
        await notesAPI.create(noteData);
        toast.success('Note created successfully');
      }

      setFormData({ title: '', content: '', tags: '', priority: 'medium', category: '' });
      setShowCreateForm(false);
      setEditingNote(null);
      fetchNotes();
      fetchTenantInfo();
    } catch (error) {
      toast.error(error.message || 'Failed to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      priority: note.priority,
      category: note.category
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(noteId);
        toast.success('Note deleted successfully');
        fetchNotes();
        fetchTenantInfo();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleArchive = async (noteId) => {
    try {
      await notesAPI.toggleArchive(noteId);
      toast.success('Note archived successfully');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to archive note');
    }
  };

  const handleUpgrade = async () => {
    try {
      await tenantsAPI.upgrade(user.tenant.slug);
      toast.success('Upgraded to Pro successfully!');
      fetchTenantInfo();
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes Dashboard</h1>
          <p className="text-gray-600">Manage your notes and collaborate with your team</p>
        </div>
        <div className="flex items-center space-x-4">
          {tenantInfo && (
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Notes:</span>
                <span className="font-medium">{tenantInfo.noteCount}</span>
                <span className="text-sm text-gray-500">
                  / {tenantInfo.noteLimit === 'unlimited' ? '∞' : tenantInfo.noteLimit}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Crown className={`h-4 w-4 ${tenantInfo.subscription === 'pro' ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium capitalize">{tenantInfo.subscription}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={tenantInfo && !tenantInfo.canCreateNote}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Upgrade Banner */}
      {tenantInfo && !tenantInfo.canCreateNote && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Note Limit Reached</h3>
                <p className="text-yellow-700">You've reached the 3-note limit for the Free plan.</p>
              </div>
            </div>
            {user.role === 'admin' && (
              <button
                onClick={handleUpgrade}
                className="btn-primary flex items-center space-x-2"
              >
                <Crown className="h-5 w-5" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-field"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingNote(null);
                  setFormData({ title: '', content: '', tags: '', priority: 'medium', category: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingNote ? 'Update Note' : 'Create Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="grid gap-4">
        {notes.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">Create your first note to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{note.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                    {note.priority}
                  </span>
                  {note.isArchived && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Archived
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {note.category && (
                    <span className="flex items-center space-x-1">
                      <Tag className="h-4 w-4" />
                      <span>{note.category}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(note._id)}
                    className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;