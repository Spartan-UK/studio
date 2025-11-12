
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useFirebase } from "@/firebase"; // Use the central firebase hook
import { logEmitter } from "@/lib/log-emitter";

interface LoginOptions {
  redirect?: boolean;
  redirectPath?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useFirebase(); // Get auth from our provider
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
        // This can happen on initial load. We just wait.
        logEmitter.emit("log", { message: "[AuthProvider] Auth service not available yet. Waiting." });
        return;
    }

    logEmitter.emit("log", { message: "[AuthProvider] Setting up onAuthStateChanged listener." });
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      logEmitter.emit("log", { message: "[onAuthStateChanged] State changed.", data: { uid: firebaseUser?.uid } });
      setUser(firebaseUser);
      setLoading(false);
      
      if (!firebaseUser && !pathname.startsWith('/check-in') && !pathname.startsWith('/check-out') && pathname !== '/privacy-policy' && pathname !== '/') {
          router.push("/login");
      }
    });

    return () => {
        logEmitter.emit("log", { message: "[AuthProvider] Cleaning up onAuthStateChanged listener." });
        unsubscribe();
    }
  }, [auth, router, pathname]);

  const login = async (email: string, password: string, options: LoginOptions = { redirect: true, redirectPath: '/' }) => {
    if (!auth) throw new Error("Auth service is not available.");
    setLoading(true);
    logEmitter.emit("log", { message: "[login] Attempting to sign in...", data: { email } });
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        logEmitter.emit("log", { message: "[login] Sign in successful.", data: { uid: userCredential.user.uid } });
        // onAuthStateChanged will handle setting the user state.
        if (options.redirect) {
            logEmitter.emit("log", { message: `Redirecting to ${options.redirectPath}...` });
            router.push(options.redirectPath!);
        } else {
            setLoading(false);
        }
    } catch (error) {
        setLoading(false);
        logEmitter.emit("log", { message: "[login] Sign in failed.", data: error });
        throw error;
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service is not available.");
    logEmitter.emit("log", { message: "[logout] Signing out..." });
    await signOut(auth);
    // onAuthStateChanged will set user to null
    // The useEffect will then handle the redirect to /login
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
