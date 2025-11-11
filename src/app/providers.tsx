"use client";

import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
