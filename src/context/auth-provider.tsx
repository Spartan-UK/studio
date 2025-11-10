
"use client";

import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { User as UserProfile, AuthUser } from "@/lib/types";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

async function getUserProfile(
  firestore: any,
  user: FirebaseUser,
): Promise<UserProfile | null> {
  const userDocRef = doc(firestore, "users", user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    } else {
      console.warn(`No profile found for user ${user.uid}`);
      return null;
    }
  } catch (error) {
     const permissionError = new FirestorePermissionError({
      path: `users/${user.uid}`,
      operation: 'get',
    });
    errorEmitter.emit('permission-error', permissionError);
    // Return null or re-throw, but emitting the error is the key part.
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth || !firestore) {
      if (!isUserLoading) setLoading(false);
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firestore, firebaseUser);

        if (profile) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: profile.displayName || firebaseUser.displayName || "User",
              role: profile.role || 'user',
            });
        } else {
            // If no profile, treat as logged out
            setUser(null);
            await signOut(auth);
        }

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, isUserLoading, router]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting the user and redirecting
    router.push("/admin/dashboard");
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service not available");
    setLoading(true);
    await signOut(auth);
    setUser(null);
    router.push("/login");
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
