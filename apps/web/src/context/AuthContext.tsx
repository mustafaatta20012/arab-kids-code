/**
 * src/context/AuthContext.tsx
 *
 * KEY CHANGE: replaced one-time getDoc() with onSnapshot() on users/{uid}.
 * This means the moment an admin writes status:"active" to Firestore,
 * every open tab of that user gets the update in real time — no refresh needed.
 */
import React, {
  createContext, useContext, useEffect, useState, useRef, useCallback,
} from 'react';
import {
  onAuthStateChanged, signOut, setPersistence,
  browserLocalPersistence, type User,
} from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { loginWithPhone, registerParent, forgotPassword } from '../services/authService';

// ── Types ─────────────────────────────────────────────────────────────────

export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface UserProfile {
  uid:               string;
  name:              string;
  email:             string;
  phone:             string;
  role:              'parent' | 'student' | 'teacher' | 'super_admin';
  /** Legacy field — kept for backward compat */
  approved:          boolean;
  /** Legacy field — kept for backward compat */
  approvalStatus:    'pending' | 'approved' | 'rejected';
  /** Primary access gate (replaces approved/approvalStatus logic) */
  status:            AccountStatus;
  subscriptionStart: string | null;
  subscriptionEnd:   string | null;
  createdAt?:        string;
  approvedAt?:       string;
  approvedBy?:       string;
  lastLoginAt?:      string;
}

interface AuthContextValue {
  firebaseUser:         User | null;
  user:                 UserProfile | null;
  loading:              boolean;
  isAuthenticated:      boolean;
  isAdmin:              boolean;
  /** true if status === "active" OR the user is an admin */
  hasAccess:            boolean;
  /** Legacy alias — same as hasAccess */
  hasActiveSubscription: boolean;
  login:         (phone: string, password: string) => Promise<UserProfile>;
  register:      (name: string, phone: string, password: string) => Promise<UserProfile>;
  resetPassword: (phone: string) => Promise<void>;
  logout:        () => Promise<void>;
  refreshProfile: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Map a raw Firestore data object to a typed UserProfile. */
function mapProfile(uid: string, data: Record<string, any>): UserProfile {
  // Derive `status` from legacy fields if the new field is missing
  let status: AccountStatus = data.status ?? 'pending';
  if (!data.status) {
    if (data.approved === true || data.approvalStatus === 'approved') status = 'active';
    else if (data.approvalStatus === 'rejected') status = 'suspended';
  }

  return {
    uid,
    name:              data.name              ?? '',
    email:             data.email             ?? '',
    phone:             data.phone             ?? '',
    role:              data.role              ?? 'parent',
    approved:          data.approved          ?? false,
    approvalStatus:    data.approvalStatus    ?? 'pending',
    status,
    subscriptionStart: data.subscriptionStart ?? null,
    subscriptionEnd:   data.subscriptionEnd   ?? null,
    createdAt:         data.createdAt?.toDate?.()?.toISOString()  ?? '',
    approvedAt:        data.approvedAt?.toDate?.()?.toISOString() ?? '',
    approvedBy:        data.approvedBy        ?? '',
    lastLoginAt:       data.lastLoginAt?.toDate?.()?.toISOString() ?? '',
  };
}

// ── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser]                 = useState<UserProfile | null>(null);
  const [loading, setLoading]           = useState(true);

  const isMounted         = useRef(true);
  const profileUnsub      = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Subscribe to live profile ──────────────────────────────────────────
  const subscribeToProfile = useCallback((fbUser: User) => {
    // Cancel any previous subscription
    profileUnsub.current?.();

    const ref = doc(db, 'users', fbUser.uid);
    profileUnsub.current = onSnapshot(
      ref,
      (snap) => {
        if (!isMounted.current) return;
        if (snap.exists()) {
          setUser(mapProfile(fbUser.uid, snap.data()));
        } else {
          // Document may not exist yet right after registration — keep null
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        // Permission error or offline — fail gracefully
        console.error('[AuthContext] profile snapshot error:', err);
        if (isMounted.current) setLoading(false);
      },
    );
  }, []);

  // ── Unsubscribe from profile ───────────────────────────────────────────
  const unsubscribeProfile = useCallback(() => {
    profileUnsub.current?.();
    profileUnsub.current = null;
  }, []);

  // ── Auth state listener ────────────────────────────────────────────────
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (!isMounted.current) return;

      if (fbUser) {
        setFirebaseUser(fbUser);
        subscribeToProfile(fbUser);   // ← live profile listener
      } else {
        setFirebaseUser(null);
        setUser(null);
        unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubscribeProfile();
    };
  }, [subscribeToProfile, unsubscribeProfile]);

  // ── Derived state ──────────────────────────────────────────────────────
  const isAuthenticated = !!firebaseUser && !!user;

  const isAdmin = isAuthenticated &&
    (user?.role === 'teacher' || user?.role === 'super_admin');

  const hasAccess = isAuthenticated &&
    (isAdmin || user?.status === 'active');

  // ── Actions ────────────────────────────────────────────────────────────

  const login = async (phone: string, password: string): Promise<UserProfile> => {
    const profile = await loginWithPhone(phone, password);
    // onSnapshot will auto-update user state — return profile for redirect logic
    return profile;
  };

  const register = async (
    name: string, phone: string, password: string,
  ): Promise<UserProfile> => {
    const profile = await registerParent({ name, phone, password });
    return profile;
  };

  const resetPassword = async (phone: string): Promise<void> => {
    const email = phone.includes('@')
      ? phone
      : `${phone.replace(/\D/g, '')}@arabkids.app`;
    await forgotPassword(email);
  };

  const logout = async (): Promise<void> => {
    unsubscribeProfile();
    await signOut(auth);
    if (isMounted.current) {
      setFirebaseUser(null);
      setUser(null);
    }
  };

  /** No-op — kept for backward compat; onSnapshot makes it automatic */
  const refreshProfile = () => {
    if (firebaseUser) subscribeToProfile(firebaseUser);
  };

  // ── Value ──────────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    firebaseUser,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    hasAccess,
    hasActiveSubscription: hasAccess,   // legacy alias
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
