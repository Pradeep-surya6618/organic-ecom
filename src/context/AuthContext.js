import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const CUSTOMER_KEY = 'organic_user';
const ADMIN_KEY = 'organic_admin';

// Central fetch wrapper. The bearer token is read from a specific storage key so
// the customer session (organic_user) and admin session (organic_admin) stay
// completely independent — the backend prioritises the bearer header over the
// shared cookie, so both can be authenticated at the same time.
async function apiCall(endpoint, options = {}, storageKey = CUSTOMER_KEY) {
  let token = null;
  try {
    const stored = localStorage.getItem(storageKey);
    token = stored ? JSON.parse(stored).token : null;
  } catch { /* ignore */ }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.statusCode = res.status;
    throw error;
  }

  return body; // { statusCode, data, message, success }
}

// Runs an apiCall, showing a success toast (using the backend message when
// available) or an error toast, then re-throws so callers can control flow.
async function runWithToast(promise, fallbackMessage) {
  try {
    const res = await promise;
    toast.success((res && res.message) || fallbackMessage);
    return res;
  } catch (err) {
    toast.error(err.message || 'Something went wrong. Please try again.');
    throw err;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // customer session
  const [admin, setAdmin] = useState(null);  // admin session (independent)
  const [isAuthReady, setIsAuthReady] = useState(false);

  // On mount, restore both sessions from localStorage.
  useEffect(() => {
    try {
      let savedUser = localStorage.getItem(CUSTOMER_KEY);
      let savedAdmin = localStorage.getItem(ADMIN_KEY);

      // Migration: an admin previously stored under the customer key (the old
      // single-session model) → move it to the admin key so it stays separate.
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'superadmin')) {
          if (!savedAdmin) {
            localStorage.setItem(ADMIN_KEY, savedUser);
            savedAdmin = savedUser;
          }
          localStorage.removeItem(CUSTOMER_KEY);
          savedUser = null;
        }
      }

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
    } catch { /* ignore */ }
    setIsAuthReady(true);
  }, []);

  const persistUser = (data) => {
    setUser(data);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data));
  };
  const persistAdmin = (data) => {
    setAdmin(data);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
  };

  // ── Customer registration ──────────────────────────────────────
  const register = useCallback(async ({ fullName, email, phone, password }) => {
    const res = await runWithToast(
      apiCall('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, phone, password }) }),
      'Verification code sent to your email.'
    );
    return res.data;
  }, []);

  const verifyRegistrationOtp = useCallback(async ({ email, otp }) => {
    const res = await runWithToast(
      apiCall('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
      'Account verified. Welcome aboard!'
    );
    persistUser(res.data);
    return res.data;
  }, []);

  // ── Customer login (rejects admin accounts — they use the admin portal) ──
  const login = useCallback(async ({ email, password }) => {
    const res = await runWithToast(
      apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
      'Verification code sent.'
    );
    return res.data;
  }, []);

  const verifyLoginOtp = useCallback(async ({ email, otp }) => {
    let res;
    try {
      res = await apiCall('/auth/verify-login-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code.');
      throw err;
    }
    const role = res.data?.role;
    if (role === 'admin' || role === 'superadmin') {
      toast.error('Admin accounts must sign in through the admin portal.');
      throw new Error('Admin accounts must use the admin portal.');
    }
    persistUser(res.data);
    toast.success(res.message || 'Signed in successfully.');
    return res.data;
  }, []);

  const resendOtp = useCallback(async ({ email, purpose }) => {
    return runWithToast(
      apiCall('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email, purpose }) }),
      'A new code has been sent.'
    );
  }, []);

  // ── Forgot password flow (customer) ────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    return runWithToast(
      apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
      'Password reset code sent.'
    );
  }, []);

  const verifyResetOtp = useCallback(async ({ email, otp }) => {
    const res = await runWithToast(
      apiCall('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
      'Code verified.'
    );
    return res.data.resetToken;
  }, []);

  const resetPassword = useCallback(async ({ resetToken, newPassword }) => {
    return runWithToast(
      apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) }),
      'Password updated. Please sign in.'
    );
  }, []);

  // ── Update customer profile ────────────────────────────────────
  const updateProfile = useCallback(async ({ name, phone }) => {
    const res = await runWithToast(
      apiCall('/auth/update-profile', { method: 'PUT', body: JSON.stringify({ name, phone }) }),
      'Profile updated.'
    );
    const updatedUser = { ...user, name: res.data?.name || name, phone: res.data?.phone || phone };
    persistUser(updatedUser);
    return res.data;
  }, [user]);

  // ── Customer logout ────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' }, CUSTOMER_KEY);
    } catch { /* clear locally regardless */ }
    setUser(null);
    localStorage.removeItem(CUSTOMER_KEY);
    toast.success('Logged out.');
  }, []);

  // ── Admin login (independent session, rejects non-admin accounts) ──
  const adminLogin = useCallback(async ({ email, password }) => {
    const res = await runWithToast(
      apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, ADMIN_KEY),
      'Verification code sent.'
    );
    return res.data;
  }, []);

  const adminVerifyLoginOtp = useCallback(async ({ email, otp }) => {
    let res;
    try {
      res = await apiCall('/auth/verify-login-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }, ADMIN_KEY);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code.');
      throw err;
    }
    const role = res.data?.role;
    if (!(role === 'admin' || role === 'superadmin')) {
      toast.error('This is not an admin account. Use the customer sign in.');
      throw new Error('This account does not have admin access.');
    }
    persistAdmin(res.data);
    toast.success(res.message || 'Signed in successfully.');
    return res.data;
  }, []);

  // ── Admin logout ───────────────────────────────────────────────
  const adminLogout = useCallback(async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' }, ADMIN_KEY);
    } catch { /* clear locally regardless */ }
    setAdmin(null);
    localStorage.removeItem(ADMIN_KEY);
    toast.success('Logged out.');
  }, []);

  const isLoggedIn = !!user;   // customer signed in
  const isCustomer = !!user;   // storefront shopper (customer is never an admin)
  const isAdmin = !!admin;     // admin portal signed in (independent of customer)

  return (
    <AuthContext.Provider value={{
      // customer session
      user, isLoggedIn, isCustomer, isAuthReady,
      register, verifyRegistrationOtp,
      login, verifyLoginOtp, resendOtp,
      forgotPassword, verifyResetOtp, resetPassword,
      updateProfile, logout,
      // admin session (independent)
      admin, isAdmin,
      adminLogin, adminVerifyLoginOtp, adminLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
