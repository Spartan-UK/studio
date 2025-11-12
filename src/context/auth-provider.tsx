
"use client";

import { useFirebase } from "@/firebase";
import type { AuthUser, User as UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  Auth,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
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
  const usersColRef = collection(firestore, "users");
  const q = query(usersColRef, where("uid", "==", firebaseUser.uid));

  try {
    logEmitter.emit('log', { message: `[getUserProfile] Executing query for user...`});
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
      logEmitter.emit('log', { message: `[getUserProfile] Profile found.`, data: userProfile });
      return userProfile;
    } else {
      logEmitter.emit('log', { message: `[getUserProfile] Query successful, but no profile document found for UID: ${firebaseUser.uid}.` });
      return null;
    }
  } catch (error: any) {
    logEmitter.emit('log', { message: `[getUserProfile] Error during query.`, data: { code: error.code, message: error.message }});
    console.error("Error querying for user profile:", error);
    return null;
  }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, firestore, areServicesAvailable } = useFirebase();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    logEmitter.emit('log', { message: "[AuthProvider] useEffect triggered." });
    if (!areServicesAvailable || !auth || !firestore) {
      logEmitter.emit('log', { message: "[AuthProvider] Services not available yet. Waiting." });
      // Keep loading until services are ready, but don't return indefinitely.
      // We set loading to true initially and it will be set to false inside the listener.
      return;
    }
    
    logEmitter.emit('log', { message: "[AuthProvider] Services available. Setting up onAuthStateChanged listener." });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      logEmitter.emit('log', { message: "[onAuthStateChanged] Auth state changed." });
      if (firebaseUser) {
        // We set loading to true here to indicate we are fetching the profile
        setLoading(true);
        logEmitter.emit('log', { message: `[onAuthStateChanged] Firebase user found. UID: ${firebaseUser.uid}. Attempting to get profile.`});
        const profile = await getUserProfile(firestore, firebaseUser);

        if (profile) {
          logEmitter.emit('log', { message: `[onAuthStateChanged] Profile found for ${profile.displayName}. Setting user state.` });
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.displayName,
            role: profile.role || "user",
          };
          setUser(authUser);
          
          if (pathname === '/login') {
            logEmitter.emit('log', { message: `[onAuthStateChanged] User on login page. Redirecting to /dashboard.` });
            router.push('/dashboard');
          }

        } else {
             logEmitter.emit('log', { message: `[onAuthStateChanged] No profile found in database. Treating as a guest user.` });
             // When no profile is found, we should still set a user object, but with default role.
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.email || "User", 
                role: 'user'
             });
        }
      } else {
        logEmitter.emit('log', { message: `[onAuthStateChanged] No Firebase user. Setting user state to null.` });
        setUser(null);
      }
      // This is the crucial part: set loading to false AFTER processing is complete.
      logEmitter.emit('log', { message: "[onAuthStateChanged] Finished processing. Setting loading to false." });
      setLoading(false);
    });

    return () => {
      logEmitter.emit('log', { message: "[AuthProvider] Cleaning up useEffect. Unsubscribing from onAuthStateChanged." });
      unsubscribe();
    };
  }, [areServicesAvailable, auth, firestore, router, pathname]);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth service not available");
    logEmitter.emit('log', { message: `[login] Attempting to sign in with email: ${email}` });
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        logEmitter.emit('log', { message: `[login] signInWithEmailAndPassword successful. onAuthStateChanged will handle the rest.` });
        // Don't setLoading(false) here. Let the onAuthStateChanged listener do it.
    } catch (error: any) {
        logEmitter.emit('log', { message: `[login] signInWithEmailAndPassword failed.`, data: { code: error.code, message: error.message } });
        setLoading(false); 
        throw error;
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service not available");
    logEmitter.emit('log', { message: `[logout] Signing out user.` });
    await signOut(auth);
    setUser(null);
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
