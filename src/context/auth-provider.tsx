
"use client";

import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
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
  firebaseUser: FirebaseUser
): Promise<UserProfile | null> {
  // A query is being used here because the user's uid from Firebase Auth may not be the doc ID
  // in the 'users' collection if they were created manually. This is more robust.
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("uid", "==", firebaseUser.uid));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.warn(`User profile for UID ${firebaseUser.uid} not found.`);
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error) {
    // This is the critical error that was happening.
    // The query requires 'list' permission, which was not correctly granted.
    // Now, a specific rule allows this query, but we still keep the error handling.
    const permissionError = new FirestorePermissionError({
      path: `users`,
      operation: 'list', // This was the operation failing.
    });
    // We emit the error for debugging, but the primary failure is the sign-out below.
    errorEmitter.emit('permission-error', permissionError);
    console.error("Failed to fetch user profile due to permissions.", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // If Firebase services themselves are still loading, we are in a loading state.
    if (isUserLoading) {
      setLoading(true);
      return;
    }
    // If auth service isn't available after loading, stop.
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // We have a firebase user, now fetch their profile from firestore
        const profile = await getUserProfile(firestore, firebaseUser);

        if (profile) {
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.displayName,
            role: profile.role || "user",
          };
          setUser(authUser);
          
          if (pathname === '/login') {
            router.push('/admin/dashboard');
          }

        } else {
             // Profile doesn't exist or failed to fetch, this is a critical error.
             // The user is authenticated with Firebase, but has no corresponding record in our DB.
             // We must sign them out to prevent an inconsistent state.
             await signOut(auth);
             setUser(null);
             toast({
               variant: "destructive",
               title: "Profile Not Found",
               description: "Your account is not registered correctly. Please contact an administrator.",
             });
             // No need to redirect here, signOut will trigger another auth state change to null.
        }
      } else {
        // firebaseUser is null, so they are logged out.
        setUser(null);
      }
      // Only set loading to false after all auth logic is complete.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, isUserLoading, router, toast, pathname]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    // Set loading to true immediately on login attempt
    setLoading(true);

    // signInWithEmailAndPassword will trigger the onAuthStateChanged listener,
    // which will then handle fetching the profile and setting the final user state.
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service not available");
    await signOut(auth);
    setUser(null); // Immediately clear user state
    router.push("/login");
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
