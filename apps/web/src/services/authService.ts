import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Types ──────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'parent' | 'student' | 'teacher' | 'super_admin';
  approved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'pending' | 'active' | 'suspended';
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  createdAt: string;
  lastLoginAt?: string;
}

// ── Register ───────────────────────────────────────────────────────────────
export const registerParent = async (input: {
  name: string;
  phone: string;
  password: string;
}): Promise<UserProfile> => {
  // Use phone as email if no @, or use phone@arabkids.app as synthetic email
  const email = `${input.phone.replace(/\D/g, '')}@arabkids.app`;

  let uid: string;

  try {
    // ── Try creating a brand-new Auth account ──────────────────────────────
    const credential = await createUserWithEmailAndPassword(auth, email, input.password);
    uid = credential.user.uid;
  } catch (err: any) {
    if (err.code !== 'auth/email-already-in-use') throw err;

    // ── Auth account exists — check if Firestore doc was deleted ──────────
    // Try signing in with the supplied password to get the uid
    let existingUid: string;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, input.password);
      existingUid = cred.user.uid;
    } catch {
      // Password is wrong — the account truly exists with a different password
      throw err; // re-throw original email-already-in-use error
    }

    // Check if the Firestore document still exists
    const snap = await getDoc(doc(db, 'users', existingUid));
    if (snap.exists()) {
      // Document exists → genuinely a duplicate registration
      throw err;
    }

    // Document was deleted → re-create it for this uid
    uid = existingUid;
  }

  const profile: Omit<UserProfile, 'uid'> = {
    name:             input.name,
    email,
    phone:            input.phone,
    role:             'parent',
    approved:         false,
    approvalStatus:   'pending',
    status:           'pending',
    subscriptionStart: null,
    subscriptionEnd:   null,
    createdAt:        new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return { uid, ...profile };
};

// ── Restore / create admin profile ────────────────────────────────────────
/**
 * Handles two cases:
 *  1. Account fully deleted from Firebase Auth → creates brand-new Auth account + Firestore doc
 *  2. Auth account exists but Firestore doc deleted → signs in + recreates Firestore doc
 */
export const restoreAdminProfile = async (
  phone: string,
  password: string,
  name: string = 'مصطفى عطا',
): Promise<UserProfile> => {
  const email = phone.includes('@')
    ? phone
    : `${phone.replace(/\D/g, '')}@arabkids.app`;

  let uid: string;

  try {
    // Case 1: Auth account was fully deleted → create fresh
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
  } catch (createErr: any) {
    if (createErr.code !== 'auth/email-already-in-use') throw createErr;

    // Case 2: Auth account still exists → sign in to get uid
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      uid = credential.user.uid;
    } catch (signInErr: any) {
      // Wrong password for the existing account
      throw signInErr;
    }
  }

  const profile: Omit<UserProfile, 'uid'> = {
    name,
    email,
    phone,
    role:             'super_admin',
    approved:         true,
    approvalStatus:   'approved',
    status:           'active',
    subscriptionStart: null,
    subscriptionEnd:   null,
    createdAt:        new Date().toISOString(),
  };

  // Always overwrite the Firestore document completely
  await setDoc(
    doc(db, 'users', uid),
    { ...profile, createdAt: serverTimestamp() },
    { merge: false },
  );

  return { uid, ...profile };
};

// ── Login ──────────────────────────────────────────────────────────────────
export const loginWithPhone = async (
  phoneOrEmail: string,
  password: string,
): Promise<UserProfile> => {
  const email = phoneOrEmail.includes('@')
    ? phoneOrEmail
    : `${phoneOrEmail.replace(/\D/g, '')}@arabkids.app`;

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Always update lastLoginAt (and create doc if missing for pre-existing Auth users)
  await setDoc(
    doc(db, 'users', uid),
    {
      lastLoginAt: serverTimestamp(),
      email,
      // Only set defaults if document is brand new (merge won't overwrite existing fields)
    },
    { merge: true },
  );

  const profile = await getUserProfile(uid);
  if (!profile) {
    // Auth succeeded but Firestore document was deleted.
    // Throw a typed error so the UI can show a helpful message.
    const e: any = new Error('profile-not-found');
    e.code = 'auth/profile-not-found';
    throw e;
  }
  return profile;
};

// ── Logout ─────────────────────────────────────────────────────────────────
export const logout = () => signOut(auth);

// ── Get current user profile from Firestore ───────────────────────────────
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    name:             data.name ?? '',
    email:            data.email ?? '',
    phone:            data.phone ?? '',
    role:             data.role ?? 'parent',
    approved:         data.approved ?? false,
    approvalStatus:   data.approvalStatus ?? 'pending',
    status:           data.status ?? (data.approved ? 'active' : 'pending'),
    subscriptionStart: data.subscriptionStart ?? null,
    subscriptionEnd:   data.subscriptionEnd ?? null,
    createdAt:        data.createdAt?.toDate?.()?.toISOString() ?? '',
    lastLoginAt:      data.lastLoginAt?.toDate?.()?.toISOString() ?? '',
  };
};

// ── Forgot password ────────────────────────────────────────────────────────
export const forgotPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

// ── Change password ────────────────────────────────────────────────────────
export const changePassword = async (newPassword: string) => {
  if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
  await updatePassword(auth.currentUser, newPassword);
};

// ── Auth state observer ───────────────────────────────────────────────────
export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

// ── Update user profile ───────────────────────────────────────────────────
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', uid), data as any);
};
