import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Building2, User, Crown } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">YardStick Notes</h1>
                <p className="text-sm text-gray-500">{user?.tenant?.name}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.email}
                </span>
                {user?.role === 'admin' && (
                  <Crown className="h-4 w-4 text-yellow-500" title="Admin" />
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;