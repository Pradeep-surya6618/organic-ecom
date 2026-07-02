import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();

  // Fallback to the customer session in localStorage to avoid state-restoration
  // latency on refresh. The admin session is separate and irrelevant here.
  let loggedIn = isLoggedIn;
  try {
    if (localStorage.getItem('organic_user')) loggedIn = true;
  } catch (e) {
    // ignore
  }

  return loggedIn ? children : <Navigate to="/login" replace />;
}