'use client';

import React, { useMemo, useRef, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const servicesRef = useRef<ReturnType<typeof initializeFirebase> | null>(null);

  const firebaseServices = useMemo(() => {
    if (typeof window === 'undefined') {
      console.warn('[FirebaseClientProvider] Attempted to initialise Firebase on the server.');
      return null;
    }

    if (!servicesRef.current) {
      servicesRef.current = initializeFirebase();
      console.debug('[FirebaseClientProvider] Firebase services initialised.');
    }

    return servicesRef.current;
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp ?? null}
      auth={firebaseServices?.auth ?? null}
      firestore={firebaseServices?.firestore ?? null}
    >
      {children}
    </FirebaseProvider>
  );
}
