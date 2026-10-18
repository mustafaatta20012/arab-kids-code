import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

// Submit contact message
export const submitContact = async (input: {
  name: string;
  phone: string;
  message: string;
}): Promise<void> => {
  await addDoc(collection(db, 'contacts'), {
    name:      input.name.trim().slice(0, 100),
    phone:     input.phone.trim().slice(0, 20),
    message:   input.message.trim().slice(0, 1000),
    createdAt: serverTimestamp(),
    read:      false,
  });
};

// Admin: Get all contact messages
export const getContacts = async (): Promise<any[]> => {
  const q = query(
    collection(db, 'contacts'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id:        d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
  }));
};
