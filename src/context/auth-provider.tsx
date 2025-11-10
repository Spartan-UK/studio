
"use client";

import { useFirebase } from "@/firebase";
import type { Employee, User } from "@/lib/types";
import {
  collection,
  getDocs,
  query,
  where,
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
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

async function getUserRole(
  auth: Auth,
  fsUser: FirebaseUser
): Promise<"admin" | "reception"> {
  if (fsUser.email === "it@spartanuk.co.uk") {
    return "admin";
  }
  return "reception";
}

async function getEmployeeProfile(
  firestore: any,
  email: string
): Promise<Employee | null> {
  const employeesRef = collection(firestore, "employees");
  const q = query(employeesRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Employee;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, isUserLoading } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth || !firestore) {
      if (!isUserLoading) setLoading(false);
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const [profile, role] = await Promise.all([
          getEmployeeProfile(firestore, firebaseUser.email || ""),
          getUserRole(auth, firebaseUser),
        ]);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile?.displayName || firebaseUser.displayName || "User",
          role: role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore, isUserLoading]);

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

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
