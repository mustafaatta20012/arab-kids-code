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

  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  const uid = credential.user.uid;

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
  if (!profile) throw new Error('لم يتم العثور على بيانات المستخدم');
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
