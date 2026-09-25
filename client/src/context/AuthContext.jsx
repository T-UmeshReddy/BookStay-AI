/**
 * context/AuthContext.jsx — Authentication Context
 *
 * Manages the logged-in user state, persists JWT to localStorage,
 * and exposes login / logout / register actions to all child components.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// ── State shape ───────────────────────────────────────────────
const initialState = {
  user: null,       // { _id, name, email, role, token, ... }
  loading: true,    // True while restoring session from localStorage
  isAuthenticated: false,
};

// ── Reducer ───────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nomadnest-user');
    if (savedUser) {
      try {
        dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      } catch {
        localStorage.removeItem('nomadnest-user');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('nomadnest-user', JSON.stringify(data));
    dispatch({ type: 'SET_USER', payload: data });
    toast.success(`Welcome back, ${data.name}! 👋`);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const data = await authService.register({ name, email, password, phone });
    localStorage.setItem('nomadnest-user', JSON.stringify(data));
    dispatch({ type: 'SET_USER', payload: data });
    toast.success(`Account created! Welcome to NomadNest 🎉`);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nomadnest-user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    const merged = { ...state.user, ...updatedData };
    localStorage.setItem('nomadnest-user', JSON.stringify(merged));
    dispatch({ type: 'SET_USER', payload: merged });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
