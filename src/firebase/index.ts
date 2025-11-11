'use client';

import { firebaseConfig as importedFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// This is a temporary solution to handle the config object discrepancy.
// The config.ts now directly initializes, so this file adapts to that.
const firebaseConfig = {
  "projectId": "studio-1817671455-2ce59",
  "appId": "1:1060068909469:web:188fe540787d0792118f74",
  "apiKey": "AIzaSyAQCAgCClvpBnyxEGUHbaDMbc_JoyipZF0",
  "authDomain": "studio-1817671455-2ce59.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1060068909469"
};


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
