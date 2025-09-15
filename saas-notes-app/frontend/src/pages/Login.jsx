import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, Building2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Login successful!');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = (email) => setFormData({ email, password: 'password' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Building2 className="mx-auto h-14 w-14 text-indigo-600" />
          <h2 className="mt-4 text-4xl font-extrabold text-gray-900">YardStick Notes</h2>
          <p className="mt-2 text-sm text-gray-600">Multi-Tenant SaaS Notes Application</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-10 py-2"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-10 py-2"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>
              Test accounts use password: <code className="bg-gray-100 px-1 rounded">password</code>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin@acme.test')}
                className="w-full py-1 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors text-xs font-medium"
              >
                Acme Admin
              </button>
              <button
                onClick={() => quickLogin('user@acme.test')}
                className="w-full py-1 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors text-xs font-medium"
              >
                Acme Member
              </button>
              <button
                onClick={() => quickLogin('admin@globex.test')}
                className="w-full py-1 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors text-xs font-medium"
              >
                Globex Admin
              </button>
              <button
                onClick={() => quickLogin('user@globex.test')}
                className="w-full py-1 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors text-xs font-medium"
              >
                Globex Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;