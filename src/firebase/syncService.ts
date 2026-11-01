import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

/**
 * Real-time Firestore Collection Listener
 * Subscribes to changes in a Firestore collection and calls onUpdate callback.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as T);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`[Firestore] Error reading collection "${collectionName}":`, error.message);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn(`[Firestore] Failed to subscribe to "${collectionName}":`, err.message);
    return () => {};
  }
}

/**
 * Save or Update a Document in Firestore
 */
export async function saveFirestoreDoc(
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to save document in "${collectionName}/${docId}":`, err.message);
    return false;
  }
}

/**
 * Delete a Document from Firestore
 */
export async function deleteFirestoreDoc(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.warn(`[Firestore] Failed to delete document in "${collectionName}/${docId}":`, err.message);
    return false;
  }
}
