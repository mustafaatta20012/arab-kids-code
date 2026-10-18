/**
 * src/context/AuthContext.tsx
 * Single source of truth for Firebase Auth + Firestore profile.
 * Replaces the old Zustand useAuthStore.
 */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
  loginWithPhone,
  registerParent,
  forgotPassword,
} from '../services/authService';

// ── Types ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'parent' | 'student' | 'teacher' | 'super_admin';
  approved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  createdAt?: string;
}

interface AuthContextValue {
  /** Raw Firebase user (null if logged out) */
  firebaseUser: User | null;
  /** Firestore profile document */
  user: UserProfile | null;
  /** True until the first onAuthStateChanged callback fires */
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  // Actions
  login: (phone: string, password: string) => Promise<UserProfile>;
  register: (name: string, phone: string, password: string) => Promise<UserProfile>;
  resetPassword: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Manually refresh the Firestore profile (e.g. after admin changes role) */
  refreshProfile: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser]                 = useState<UserProfile | null>(null);
  const [loading, setLoading]           = useState(true);

  // Track mounted state to avoid state updates on unmounted component
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Load Firestore profile for a Firebase user ─────────────────────────
  const loadProfile = async (fbUser: User): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        uid:               fbUser.uid,
        name:              data.name              ?? '',
        email:             data.email             ?? fbUser.email ?? '',
        phone:             data.phone             ?? '',
        role:              data.role              ?? 'parent',
        approved:          data.approved          ?? false,
        approvalStatus:    data.approvalStatus    ?? 'pending',
        subscriptionStart: data.subscriptionStart ?? null,
        subscriptionEnd:   data.subscriptionEnd   ?? null,
        createdAt:         data.createdAt?.toDate?.()?.toISOString() ?? '',
      };
    } catch {
      return null;
    }
  };

  // ── Manually refresh profile (after admin edits Firestore) ─────────────
  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const profile = await loadProfile(firebaseUser);
    if (isMounted.current) setUser(profile);
  };

  // ── Auth state listener (single source of truth) ───────────────────────
  useEffect(() => {
    // Ensure persistence is set before listening
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!isMounted.current) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await loadProfile(fbUser);
        if (isMounted.current) {
          setUser(profile);
          setLoading(false);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────
  const isAuthenticated = !!firebaseUser && !!user;

  const isAdmin = isAuthenticated &&
    (user?.role === 'teacher' || user?.role === 'super_admin');

  const hasActiveSubscription = isAuthenticated && (
    user?.approved === true && (
      !user.subscriptionEnd ||
      new Date(user.subscriptionEnd) > new Date()
    )
  );

  // ── Actions ────────────────────────────────────────────────────────────

  const login = async (phone: string, password: string): Promise<UserProfile> => {
    const profile = await loginWithPhone(phone, password);
    if (isMounted.current) setUser(profile);
    return profile;
  };

  const register = async (
    name: string,
    phone: string,
    password: string,
  ): Promise<UserProfile> => {
    const profile = await registerParent({ name, phone, password });
    if (isMounted.current) setUser(profile);
    return profile;
  };

  const resetPassword = async (phone: string): Promise<void> => {
    const email = phone.includes('@')
      ? phone
      : `${phone.replace(/\D/g, '')}@arabkids.app`;
    await forgotPassword(email);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    if (isMounted.current) {
      setFirebaseUser(null);
      setUser(null);
    }
  };

  // ── Value ──────────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    firebaseUser,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    login,
    register,
    resetPassword,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
