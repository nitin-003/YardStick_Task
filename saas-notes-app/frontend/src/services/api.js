import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle validation errors specifically
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.join(', ') || 
                        error.message || 
                        'An error occurred';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      response: error.response
    });
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  me: () => api.get('/api/auth/me'),
  invite: (userData) => api.post('/api/auth/invite', userData),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/api/auth/change-password', passwordData),
};

// Notes API
export const notesAPI = {
  create: (noteData) => api.post('/api/notes', noteData),
  getAll: (params = {}) => api.get('/api/notes', { params }),
  getById: (id) => api.get(`/api/notes/${id}`),
  update: (id, noteData) => api.put(`/api/notes/${id}`, noteData),
  delete: (id) => api.delete(`/api/notes/${id}`),
  toggleArchive: (id) => api.patch(`/api/notes/${id}/archive`),
};

// Tenants API
export const tenantsAPI = {
  getInfo: (slug) => api.get(`/api/tenants/${slug}`),
  upgrade: (slug) => api.post(`/api/tenants/${slug}/upgrade`),
  getStats: (slug) => api.get(`/api/tenants/${slug}/stats`),
};

// Health API
export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;