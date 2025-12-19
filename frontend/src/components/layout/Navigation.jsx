import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">
                MedTranslate
              </span>
            </Link>
            
            {user && (
              <nav className="hidden md:flex space-x-1">
                <Link
                  to="/translate"
                  className={`nav-link px-4 py-2 rounded-lg ${
                    isActive('/translate') ? 'active bg-blue-50' : ''
                  }`}
                >
                  Translate
                </Link>
                <Link
                  to="/history"
                  className={`nav-link px-4 py-2 rounded-lg ${
                    isActive('/history') ? 'active bg-blue-50' : ''
                  }`}
                >
                  History
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-slate-100 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600 max-w-32 truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-slate-600 hover:text-red-600 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {user && (
        <div className="md:hidden border-t border-slate-200 bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-3">
              <Link
                to="/translate"
                className={`nav-link px-4 py-2 rounded-lg ${
                  isActive('/translate') ? 'active bg-blue-50' : ''
                }`}
              >
                Translate
              </Link>
              <Link
                to="/history"
                className={`nav-link px-4 py-2 rounded-lg ${
                  isActive('/history') ? 'active bg-blue-50' : ''
                }`}
              >
                History
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;