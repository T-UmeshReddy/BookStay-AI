/**
 * components/common/Navbar.jsx — Top Navigation Bar
 *
 * Responsive navbar with mobile menu, theme toggle,
 * auth-aware links, and animated active states.
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, User, LayoutDashboard, LogOut, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);        // Mobile menu
  const [scrolled, setScrolled] = useState(false);    // Scroll shadow
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add shadow when page is scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Explore', to: '/rooms' },
    { label: 'About', to: '/#about' },
  ];
  const isTransparentLandingHeader = location.pathname === '/' && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/90 dark:bg-navy-900/90 backdrop-blur-md shadow-card dark:shadow-card-dark'
          : 'bg-transparent'
        }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                            shadow-glow-sm group-hover:shadow-glow-brand transition-shadow duration-300">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className={`font-display font-bold text-xl ${isTransparentLandingHeader ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
              Nomad<span className="text-brand-500">Nest</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                   ${isActive && link.label !== 'About'
                     ? `${isTransparentLandingHeader ? 'text-brand-300 bg-white/15' : 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10'}`
                     : `${isTransparentLandingHeader ? 'text-white' : 'text-slate-700 dark:text-slate-200'} hover:text-brand-500 dark:hover:text-brand-300 hover:bg-slate-100/10 dark:hover:bg-slate-800`
                   }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {['Staff', 'Admin'].includes(user?.role) && (
              <NavLink
                to={user.role === 'Admin' ? '/admin' : '/staff'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                   ${isActive ? 'text-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'text-slate-600 dark:text-slate-300 hover:text-brand-500'}`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Auth controls */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  id="user-menu-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 card py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      {user?.role === 'Guest' && (
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <User className="w-4 h-4" /> My Bookings
                        </Link>
                      )}
                      {['Staff', 'Admin'].includes(user?.role) && (
                        <Link to={user.role === 'Admin' ? '/admin' : '/staff'} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <LayoutDashboard className="w-4 h-4" /> {user.role === 'Admin' ? 'Admin Panel' : 'Staff Panel'}
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Sign up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="md:hidden btn-ghost p-2"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-navy-900 border-t border-slate-100 dark:border-slate-700"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  {['Staff', 'Admin'].includes(user?.role) && (
                    <Link to={user.role === 'Admin' ? '/admin' : '/staff'} onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <LayoutDashboard className="w-4 h-4" /> {user.role === 'Admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
                    </Link>
                  )}
                  {user?.role === 'Guest' && (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <User className="w-4 h-4" /> My Bookings
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="btn-secondary flex-1 text-center" onClick={() => setIsOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setIsOpen(false)}>Sign up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
