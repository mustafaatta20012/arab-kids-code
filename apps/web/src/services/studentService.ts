import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Student {
  id: string;
  parentId: string;
  displayName: string;
  birthYear: number;
  avatar?: string;
  level: number;
  xp: number;
}

// Get children for current parent
export const getMyChildren = async (parentId: string): Promise<Student[]> => {
  const q = query(
    collection(db, 'students'),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id:          d.id,
    parentId:    d.data().parentId,
    displayName: d.data().displayName ?? '',
    birthYear:   d.data().birthYear ?? 2015,
    avatar:      d.data().avatar,
    level:       d.data().level ?? 1,
    xp:          d.data().xp ?? 0,
  }));
};

// Add a child
export const addChild = async (
  parentId: string,
  input: { displayName: string; birthYear: number },
): Promise<void> => {
  await addDoc(collection(db, 'students'), {
    parentId,
    displayName: input.displayName.trim(),
    birthYear:   input.birthYear,
    level:       1,
    xp:          0,
    createdAt:   serverTimestamp(),
  });
};
