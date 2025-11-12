
"use client";

import { useFirebase } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import {
  doc,
  getDoc,
  Firestore,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  Auth,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { logEmitter } from "@/lib/log-emitter";

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
  firestore: Firestore,
  firebaseUser: FirebaseUser
): Promise<UserProfile | null> {
  logEmitter.emit('log', { message: `[getUserProfile] Called for UID: ${firebaseUser.uid}`});
  const docRef = doc(firestore, "users", firebaseUser.uid);
  logEmitter.emit('log', { message: `[getUserProfile] Executing get() for user doc...`});
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const userProfile = { id: docSnap.id, ...docSnap.data() } as UserProfile;
    logEmitter.emit('log', { message: `[getUserProfile] Profile found.`, data: userProfile });
    return userProfile;
  } else {
    logEmitter.emit('log', { message: `[getUserProfile] Query successful, but no profile document found for UID: ${firebaseUser.uid}.` });
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    logEmitter.emit('log', { message: "[AuthProvider] useEffect triggered." });
    if (!auth || !firestore) {
       logEmitter.emit('log', { message: "[AuthProvider] Services not available yet. Waiting." });
       // Ensure loading is eventually false if services don't appear.
       const timer = setTimeout(() => setLoading(false), 2000);
       return () => clearTimeout(timer);
    }
    
    logEmitter.emit('log', { message: "[AuthProvider] Services available. Setting up onAuthStateChanged listener." });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        logEmitter.emit('log', { message: `[onAuthStateChanged] User detected. UID: ${firebaseUser.uid}`});
        try {
          const profile = await getUserProfile(firestore, firebaseUser);

          if (profile) {
            logEmitter.emit('log', { message: `[onAuthStateChanged] Profile found for ${profile.displayName}.` });
            const authUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: profile.displayName,
              role: profile.role || "user",
            };
            setUser(authUser);
          } else {
            logEmitter.emit('log', { message: `[onAuthStateChanged] No profile found in database. Treating as a guest user.` });
            // Keep user authenticated with Firebase, but with default 'user' role
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.email || "User", 
                role: 'user'
             });
          }
        } catch (error: any) {
           logEmitter.emit('log', { message: `[getUserProfile] Error during query.`, data: { code: error.code, message: error.message }});
           setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email || "Error User",
              role: 'user'
           });
        } finally {
            logEmitter.emit('log', { message: "[onAuthStateChanged] Finished processing. Setting loading to false." });
            setLoading(false);
        }
      } else {
        logEmitter.emit('log', { message: `[onAuthStateChanged] No Firebase user. Resetting state.` });
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      logEmitter.emit('log', { message: "[AuthProvider] Cleaning up useEffect. Unsubscribing from onAuthStateChanged." });
      unsubscribe();
    };
  }, [auth, firestore, router]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    logEmitter.emit('log', { message: `[login] Attempting to sign in with email: ${email}` });
    // No need to set loading here, onAuthStateChanged will handle it.
    try {
        await signInWithEmailAndPassword(auth, email, password);
        logEmitter.emit('log', { message: `[login] signInWithEmailAndPassword successful. onAuthStateChanged will handle the rest.` });
    } catch (error: any) {
        logEmitter.emit('log', { message: `[login] signInWithEmailAndPassword failed.`, data: { code: error.code, message: error.message } });
        // Set loading to false only on failure, so UI isn't stuck.
        setLoading(false); 
        throw error;
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service not available");
    logEmitter.emit('log', { message: `[logout] Signing out user.` });
    await signOut(auth);
    setUser(null);
    setLoading(false); // Ensure loading is false on logout.
    router.push("/"); 
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
