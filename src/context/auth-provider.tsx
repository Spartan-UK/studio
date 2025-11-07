
"use client";

import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: { [key: string]: User } = {
  "it@spartanuk.co.uk": {
    uid: "28UsazlLvnNOLzzZOuaOa2MJI9k2",
    email: "it@spartanuk.co.uk",
    name: "Spartan Admin",
    role: "admin",
  },
  "admin@spartan.com": {
    uid: "admin123",
    email: "admin@spartan.com",
    name: "Spartan Admin",
    role: "admin",
  },
  "reception@spartan.com": {
    uid: "reception456",
    email: "reception@spartan.com",
    name: "Reception Desk",
    role: "reception",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user
    const storedUser = sessionStorage.getItem("spartan-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const foundUser = mockUsers[email];
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem("spartan-user", JSON.stringify(foundUser));
      router.push("/admin/dashboard");
    } else {
      // For the prototype, allow any email to log in as a guest/reception
      const guestUser: User = {
        uid: "guest789",
        email: email,
        name: "Reception User",
        role: "reception",
      };
      setUser(guestUser);
      sessionStorage.setItem("spartan-user", JSON.stringify(guestUser));
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    sessionStorage.removeItem("spartan-user");
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
