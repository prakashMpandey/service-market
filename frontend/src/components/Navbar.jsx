import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { user, logout, isProvider } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    isActive
      ? 'text-primary-600 dark:text-primary-400 font-semibold'
      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
            Service<span className="text-primary-600 dark:text-primary-400">Market</span>
          </span>
        </NavLink>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {isProvider ? (
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/provider-bookings" className={navClass}>
                    Bookings
                  </NavLink>
                  <NavLink to="/my-services" className={navClass}>
                    My Services
                  </NavLink>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  <NavLink to="/services/nearby" className={navClass}>
                    Services
                  </NavLink>
                  <NavLink to="/my-bookings" className={navClass}>
                    Bookings
                  </NavLink>
                </div>
              )}

              {/* User Menu */}
              <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700">
                {user.role === 'provider' && (
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                      {user.username}
                    </span>
                  </NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <NavLink
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors px-3 py-1.5"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/30"
              >
                Sign Up
              </NavLink>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}