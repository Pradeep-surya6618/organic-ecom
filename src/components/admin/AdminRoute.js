import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  // Fallback to the admin session in localStorage to avoid state-restoration
  // latency on refresh (independent of the customer session).
  let localIsAdmin = false;
  try {
    const saved = localStorage.getItem('organic_admin');
    if (saved) {
      const parsed = JSON.parse(saved);
      localIsAdmin = parsed && (parsed.role === 'admin' || parsed.role === 'superadmin');
    }
  } catch (e) {
    // ignore
  }

  const isAuthorized = isAdmin || localIsAdmin;

  return isAuthorized ? children : <Navigate to="/admin/login" replace />;
}
