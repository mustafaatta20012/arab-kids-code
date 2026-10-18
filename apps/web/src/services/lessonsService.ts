import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  isPublic: boolean;
  duration: number;
  videoUrl: string;
  scratchUrl: string;
  objectives: string[];
}

export interface Progress {
  userId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  updatedAt: string;
}

export interface Submission {
  id: string;
  studentId: string;
  lessonId: string;
  type: 'project' | 'quiz';
  scratchUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
  feedback?: string;
  submittedAt: string;
}

// All lessons (public + private if logged in — enforced by rules)
export const getLessons = async (): Promise<Lesson[]> => {
  const q = query(
    collection(db, 'lessons'),
    orderBy('order', 'asc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
};

// Public lesson only (free lesson preview)
export const getFreeLesson = async (): Promise<Lesson | null> => {
  const q = query(
    collection(db, 'lessons'),
    where('isPublic', '==', true),
    orderBy('order', 'asc'),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Lesson;
};

// Single lesson by ID
export const getLessonById = async (id: string): Promise<Lesson | null> => {
  const snap = await getDoc(doc(db, 'lessons', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Lesson;
};

// Save progress
export const saveProgress = async (
  userId: string,
  lessonId: string,
  watchedSeconds: number,
  completed: boolean,
): Promise<void> => {
  const docId = `${userId}_${lessonId}`;
  await setDoc(
    doc(db, 'progress', docId),
    {
      userId,
      lessonId,
      watchedSeconds,
      completed,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

// Submit project
export const submitProject = async (
  studentId: string,
  lessonId: string,
  scratchUrl: string,
): Promise<void> => {
  await addDoc(collection(db, 'submissions'), {
    studentId,
    lessonId,
    type:       'project',
    scratchUrl,
    status:     'pending',
    submittedAt: serverTimestamp(),
  });
};

// Get my submissions
export const getMySubmissions = async (userId: string): Promise<Submission[]> => {
  const q = query(
    collection(db, 'submissions'),
    where('studentId', '==', userId),
    orderBy('submittedAt', 'desc'),
    limit(50),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id:          d.id,
    studentId:   d.data().studentId,
    lessonId:    d.data().lessonId,
    type:        d.data().type,
    scratchUrl:  d.data().scratchUrl,
    status:      d.data().status,
    score:       d.data().score,
    feedback:    d.data().feedback,
    submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
  }));
};
