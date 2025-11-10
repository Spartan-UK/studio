
"use client";

import { useFirebase } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

const formatNameFromEmail = (email: string) => {
    if (!email) return { firstName: "User", surname: "" };
    const username = email.split('@')[0];
    const parts = username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1));
    if (parts.length > 1) {
        return { firstName: parts[0], surname: parts.slice(1).join(' ') };
    }
    return { firstName: parts[0] || "User", surname: "" };
};


async function getUserProfile(
  firestore: any,
  firebaseUser: FirebaseUser
): Promise<UserProfile | null> {
  const userDocRef = doc(firestore, "users", firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } else {
    // Self-healing: if profile doesn't exist, create it.
    console.log(`User profile for ${firebaseUser.uid} not found. Creating one.`);
    
    const { firstName, surname } = formatNameFromEmail(firebaseUser.email || "");
    const newUserProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      firstName: firstName,
      surname: surname,
      displayName: `${firstName} ${surname}`.trim(),
      role: firebaseUser.email === 'it@spartanuk.co.uk' ? 'admin' : 'user',
    };

    try {
      await setDoc(userDocRef, newUserProfile);
      return newUserProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      return null;
    }
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
            role: profile.role || 'user',
          });
        } else {
          // This case should now be rare due to self-healing, but it's a safeguard.
          await signOut(auth);
          setUser(null);
          toast({
            variant: "destructive",
            title: "Profile Not Found",
            description: "Your account is not registered. Please contact an administrator.",
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
