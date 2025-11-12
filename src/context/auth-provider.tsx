
"use client";

import { useFirebase } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
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
import { FirestorePermissionError } from "@/firebase/errors";

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
  const usersColRef = collection(firestore, "users");
  // Correctly query for the document where the 'uid' field matches the firebaseUser's UID.
  const q = query(usersColRef, where("uid", "==", firebaseUser.uid));

  try {
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If a document is found, return its data.
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    } else {
      // If no document is found, log a warning and return null.
      console.warn(
        `User profile for UID ${firebaseUser.uid} not found in Firestore.`
      );
      return null;
    }
  } catch (error) {
    // Log any other errors during the query.
    console.error("Error querying for user profile:", error);
    // It's important to re-throw or handle the error appropriately.
    // For now, we will log it and return null.
    return null;
  }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
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
            router.push('/dashboard');
          }

        } else {
             await signOut(auth);
             setUser(null);
             toast({
               variant: "destructive",
               title: "Login Error",
               description: "User profile not found in the database. Please contact an administrator.",
             });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, router, toast, pathname]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        setLoading(false); // Reset loading on failure
        throw error; // Re-throw to be caught in the component
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service not available");
    await signOut(auth);
    setUser(null);
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
