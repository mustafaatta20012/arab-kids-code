/**
 * ProtectedRoute – requires the user to be logged in.
 * Shows a spinner while auth state is loading.
 * Redirects to /login and remembers the original location.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;

  if (!isAuthenticated) {
    // Save the page the user was trying to reach
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ── AdminRoute ────────────────────────────────────────────────────────────

/**
 * AdminRoute – requires teacher or super_admin role.
 */
export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ── GuestRoute ────────────────────────────────────────────────────────────

/**
 * GuestRoute – redirects logged-in users away from /login and /register.
 */
export const GuestRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) return <AuthSpinner />;

  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (user?.role === 'parent') return <Navigate to="/parent" replace />;
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

// ── Shared spinner ────────────────────────────────────────────────────────

const AuthSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        جاري التحقق من الجلسة...
      </p>
    </div>
  </div>
);
