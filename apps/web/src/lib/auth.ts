/**
 * auth.ts – Global auth state using Firebase Auth + Zustand
 * Replaces the old JWT/cookie-based auth store.
 */
import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, logout as firebaseLogout, type UserProfile } from '../services/authService';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  loadUser: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  loading: true,

  setUser: (user) => set({ user }),

  // Called once in App.tsx – sets up a persistent listener
  loadUser: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          set({ user: profile, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
  },

  logout: async () => {
    await firebaseLogout();
    set({ user: null });
  },
}));

// Convenience helper used by admin guards
export const isAdmin = (user: UserProfile | null) =>
  user?.role === 'teacher' || user?.role === 'super_admin';

export const hasActiveSubscription = (user: UserProfile | null): boolean => {
  if (!user?.approved) return false;
  if (!user.subscriptionEnd) return true; // No expiry set = active
  return new Date(user.subscriptionEnd) > new Date();
};
