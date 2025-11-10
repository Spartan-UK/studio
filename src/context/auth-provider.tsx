
"use client";

import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
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
  const usersRef = collection(firestore, "users");
  const q = query(usersRef, where("uid", "==", firebaseUser.uid));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`User profile for UID ${firebaseUser.uid} not found.`);
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: "users",
      operation: "list", // This was a query, so 'list' is the operation type
    });
    errorEmitter.emit('permission-error', permissionError);
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
    if (!auth || !firestore) {
      if (!isUserLoading) setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firestore, firebaseUser);

        if (profile) {
          const authUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.displayName,
            role: profile.role || "user",
          };
          setUser(authUser);
          
          // Redirect if on login page
          if (pathname === '/login') {
            router.push('/admin/dashboard');
          }

        } else {
             await signOut(auth);
             setUser(null);
             toast({
               variant: "destructive",
               title: "Profile Not Found",
               description:
                 "Your account is not registered. Please contact an administrator.",
             });
             if (pathname !== '/login') {
                router.push("/login");
             }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, isUserLoading, router, toast, pathname]);

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
