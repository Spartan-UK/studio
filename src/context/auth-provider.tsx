
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
  const userDocRef = doc(firestore, "users", firebaseUser.uid);

  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // Profile exists, return it
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      // Profile does NOT exist, so create it
      console.warn(
        `User profile for UID ${firebaseUser.uid} not found. Creating a new one.`
      );
      
      const [firstName, surname] = firebaseUser.email?.split('@')[0].split('.') || ['New', 'User'];
      
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${surname.charAt(0).toUpperCase() + surname.slice(1)}`,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        surname: surname.charAt(0).toUpperCase() + surname.slice(1),
        role: 'user', // Default role is 'user'
      };

      // Create the document in Firestore.
      // With open rules, this will succeed.
      await setDoc(userDocRef, newUserProfile);
      
      // Return the newly created profile
      return { id: firebaseUser.uid, ...newUserProfile };
    }
  } catch (error) {
    // This will catch any errors during getDoc or setDoc
    console.error("Failed to fetch or create user profile. Original error:", error);
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
            router.push('/dashboard');
          }

        } else {
             // Profile doesn't exist AND failed to create, this is a critical error.
             await signOut(auth);
             setUser(null);
             toast({
               variant: "destructive",
               title: "Login Error",
               description: "Could not retrieve or create your user profile. Please contact an administrator.",
             });
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
