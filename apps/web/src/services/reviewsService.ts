import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Get approved reviews only (public)
export const getApprovedReviews = async (maxItems = 20): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    authorName: d.data().authorName ?? '',
    rating:     d.data().rating ?? 5,
    comment:    d.data().comment ?? '',
    status:     d.data().status ?? 'approved',
    createdAt:  d.data().createdAt?.toDate?.()?.toISOString() ?? '',
  }));
};

// Submit a new review (status defaults to 'pending', enforced by Firestore rules)
export const submitReview = async (input: {
  authorName: string;
  rating: number;
  comment: string;
}): Promise<void> => {
  await addDoc(collection(db, 'reviews'), {
    authorName: input.authorName.trim().slice(0, 100),
    rating:     Math.max(1, Math.min(5, Math.round(input.rating))),
    comment:    input.comment.trim().slice(0, 500),
    status:     'pending',           // Security rules enforce this – cannot be overridden
    createdAt:  serverTimestamp(),
  });
};
