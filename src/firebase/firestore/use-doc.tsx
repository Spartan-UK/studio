'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
function describeDocument(target: DocumentReference<DocumentData> | null | undefined): string {
  if (!target) {
    return '[useDoc] <null-document>';
  }

  try {
    return target.path ?? target.toString();
  } catch (error) {
    console.debug('[useDoc] Failed to resolve document path:', error);
  }

  return '[useDoc] <unknown-document>';
}

export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      console.debug('[useDoc] No document reference provided. Skipping subscription.');
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const targetDescription = describeDocument(memoizedDocRef);
    console.debug(`[useDoc] Subscribing to ${targetDescription}`);

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          console.debug(`[useDoc] Snapshot received for ${targetDescription}.`);
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          console.debug(`[useDoc] Document ${targetDescription} does not exist.`);
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error(`[useDoc] Firestore error for ${targetDescription}:`, err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => {
      console.debug(`[useDoc] Unsubscribing from ${targetDescription}`);
      unsubscribe();
    };
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
