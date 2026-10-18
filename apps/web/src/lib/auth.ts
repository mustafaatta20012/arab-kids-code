/**
 * lib/auth.ts
 *
 * Backward-compatibility shim.
 * All pages that used useAuthStore() can now use useAuth() directly from
 * AuthContext. This file re-exports for convenience.
 */
export { useAuth, type UserProfile } from '../context/AuthContext';

/** Helper: check subscription validity */
export const hasActiveSubscription = (user: import('../context/AuthContext').UserProfile | null): boolean => {
  if (!user?.approved) return false;
  if (!user.subscriptionEnd) return true;
  return new Date(user.subscriptionEnd) > new Date();
};

/** Helper: check admin role */
export const isAdmin = (user: import('../context/AuthContext').UserProfile | null): boolean =>
  user?.role === 'teacher' || user?.role === 'super_admin';
