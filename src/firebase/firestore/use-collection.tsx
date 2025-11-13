'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook. * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
function describeTarget(target: CollectionReference<DocumentData> | Query<DocumentData>): string {
  if (!target) {
    return '[useCollection] <null-target>';
  }

  const maybePath = (target as CollectionReference<DocumentData>).path;
  if (maybePath) {
    return maybePath;
  }

  const internalQuery = target as InternalQuery;
  if (internalQuery?._query?.path?.canonicalString) {
    try {
      return internalQuery._query.path.canonicalString();
    } catch (error) {
      console.debug('[useCollection] Failed to read canonical path for query:', error);
    }
  }

  if (typeof target.toString === 'function') {
    return target.toString();
  }

  return '[useCollection] <unknown-target>';
}

export function useCollection<T = any>(
  memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean }) | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If there's no query provided, do nothing yet.
    if (!memoizedTargetRefOrQuery) {
      console.debug('[useCollection] No collection/query provided. Skipping subscription.');
      setIsLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const targetDescription = describeTarget(memoizedTargetRefOrQuery);
    console.debug(`[useCollection] Subscribing to ${targetDescription}`);

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        console.debug(
          `[useCollection] Snapshot received from ${targetDescription}. Document count: ${snapshot.size}`
        );
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        console.error(`[useCollection] Firestore error for ${targetDescription}:`, error);
        setError(error);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => {
      console.debug(`[useCollection] Unsubscribing from ${targetDescription}`);
      unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
