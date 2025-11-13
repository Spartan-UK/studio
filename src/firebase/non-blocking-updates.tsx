'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { User } from 'firebase/auth';

function isPermissionError(error: any): error is FirestoreError {
    return error instanceof FirestoreError && (error.code === 'permission-denied' || error.code === 'unauthenticated');
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions, user: User | null) {
  setDoc(docRef, data, options).catch(error => {
    if (isPermissionError(error)) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'write',
            requestResourceData: data,
          }, user)
        )
    } else {
        console.error("Firestore 'set' operation failed:", error);
    }
  })
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any, user: User | null = null) {
  addDoc(colRef, data)
    .catch(error => {
      if (isPermissionError(error)) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: colRef.path,
            operation: 'create',
            requestResourceData: data,
          }, user)
        )
      } else {
        console.error("Firestore 'add' operation failed:", error);
      }
    });
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any, user: User | null = null) {
  updateDoc(docRef, data)
    .catch(error => {
       if (isPermissionError(error)) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
          }, user)
        )
      } else {
        console.error("Firestore 'update' operation failed:", error);
      }
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference, user: User | null = null) {
  deleteDoc(docRef)
    .catch(error => {
       if (isPermissionError(error)) {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          }, user)
        )
      } else {
        console.error("Firestore 'delete' operation failed:", error);
      }
    });
}
