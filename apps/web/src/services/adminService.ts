import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { UserProfile } from './authService';

// ── Users ──────────────────────────────────────────────────────────────────

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid:               d.id,
      name:              data.name ?? '',
      email:             data.email ?? '',
      phone:             data.phone ?? '',
      role:              data.role ?? 'parent',
      approved:          data.approved ?? false,
      approvalStatus:    data.approvalStatus ?? 'pending',
      subscriptionStart: data.subscriptionStart ?? null,
      subscriptionEnd:   data.subscriptionEnd ?? null,
      createdAt:         data.createdAt?.toDate?.()?.toISOString() ?? '',
    } as UserProfile;
  });
};

export const updateUserApproval = async (
  userId: string,
  status: 'approved' | 'rejected' | 'pending',
  subscriptionStart?: string,
  subscriptionEnd?: string,
): Promise<void> => {
  const updates: any = {
    approvalStatus: status,
    approved:       status === 'approved',
  };
  if (subscriptionStart) updates.subscriptionStart = subscriptionStart;
  if (subscriptionEnd)   updates.subscriptionEnd   = subscriptionEnd;

  await updateDoc(doc(db, 'users', userId), updates);

  // Write audit log
  await addDoc(collection(db, 'auditLogs'), {
    adminId:   auth.currentUser?.uid ?? 'unknown',
    action:    `user.approval.${status}`,
    targetId:  userId,
    details:   updates,
    timestamp: serverTimestamp(),
  });
};

export const renewSubscription = async (
  userId: string,
  newEndDate: string,
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    subscriptionEnd:   newEndDate,
    approvalStatus:    'approved',
    approved:          true,
  });
  await addDoc(collection(db, 'auditLogs'), {
    adminId:   auth.currentUser?.uid ?? 'unknown',
    action:    'user.subscription.renew',
    targetId:  userId,
    details:   { newEndDate },
    timestamp: serverTimestamp(),
  });
};

export const revokeSubscription = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    approvalStatus: 'rejected',
    approved:       false,
  });
  await addDoc(collection(db, 'auditLogs'), {
    adminId:   auth.currentUser?.uid ?? 'unknown',
    action:    'user.subscription.revoke',
    targetId:  userId,
    details:   {},
    timestamp: serverTimestamp(),
  });
};

// ── Reviews ────────────────────────────────────────────────────────────────

export const getPendingReviews = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
  }));
};

export const moderateReview = async (
  reviewId: string,
  status: 'approved' | 'rejected',
): Promise<void> => {
  await updateDoc(doc(db, 'reviews', reviewId), { status });
  await addDoc(collection(db, 'auditLogs'), {
    adminId:   auth.currentUser?.uid ?? 'unknown',
    action:    `review.${status}`,
    targetId:  reviewId,
    details:   { status },
    timestamp: serverTimestamp(),
  });
};

// ── Submissions ────────────────────────────────────────────────────────────

export const getPendingSubmissions = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'submissions'),
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'desc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
  }));
};

export const gradeSubmission = async (
  submissionId: string,
  status: 'approved' | 'rejected',
  score?: number,
  feedback?: string,
): Promise<void> => {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status,
    ...(score    !== undefined && { score }),
    ...(feedback !== undefined && { feedback }),
  });
};

// ── Students ───────────────────────────────────────────────────────────────

export const getAllStudents = async (searchQuery = ''): Promise<any[]> => {
  const q = query(collection(db, 'users'), where('role', '==', 'parent'), limit(500));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  if (!searchQuery) return all;
  const lq = searchQuery.toLowerCase();
  return all.filter(
    (u) =>
      u.name?.toLowerCase().includes(lq) ||
      u.phone?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(lq),
  );
};

export const createFamily = async (data: {
  parentName: string;
  parentPhone: string;
  children: { name: string; birthYear: number }[];
}): Promise<void> => {
  const batch = writeBatch(db);
  // Parent user created via Firebase Auth separately, here we just add children
  data.children.forEach((child) => {
    const childRef = doc(collection(db, 'students'));
    batch.set(childRef, {
      displayName: child.name,
      birthYear:   child.birthYear,
      parentPhone: data.parentPhone,
      level:       1,
      xp:          0,
      createdAt:   serverTimestamp(),
    });
  });
  await batch.commit();
};

// ── Analytics ──────────────────────────────────────────────────────────────

export const getAnalytics = async () => {
  const [usersSnap, reviewsSnap, submissionsSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), limit(500))),
    getDocs(query(collection(db, 'reviews'), limit(500))),
    getDocs(query(collection(db, 'submissions'), limit(500))),
  ]);

  const users = usersSnap.docs.map((d) => d.data());
  const approved  = users.filter((u) => u.approvalStatus === 'approved').length;
  const pending   = users.filter((u) => u.approvalStatus === 'pending').length;

  return {
    totalUsers:       users.length,
    approvedUsers:    approved,
    pendingUsers:     pending,
    totalReviews:     reviewsSnap.size,
    totalSubmissions: submissionsSnap.size,
  };
};

// ── Audit Logs ─────────────────────────────────────────────────────────────

export const getAuditLogs = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'auditLogs'),
    orderBy('timestamp', 'desc'),
    limit(200),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? '',
  }));
};
