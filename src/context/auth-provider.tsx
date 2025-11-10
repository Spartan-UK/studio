
"use client";

import { useFirebase } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
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
  firebaseUser: FirebaseUser
): Promise<UserProfile | null> {
  // Query the 'users' collection to find the document with the matching UID.
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("uid", "==", firebaseUser.uid));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no document is found, the user profile does not exist.
      console.log(`User profile for UID ${firebaseUser.uid} not found.`);
      return null;
    }

    // Assuming UID is unique, there should be at most one document.
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // This could be a permissions error, which should be handled.
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !firestore) {
      if (!isUserLoading) setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firestore, firebaseUser);

        if (profile) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.displayName,
            role: profile.role || "user",
          });
        } else {
          // Profile doesn't exist, sign out and show error.
          await signOut(auth);
          setUser(null);
          toast({
            variant: "destructive",
            title: "Profile Not Found",
            description:
              "Your account is not registered. Please contact an administrator.",
          });
          router.push("/login");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, isUserLoading, router, toast]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    await signInWithEmailAndPassword(auth, email, password);
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
