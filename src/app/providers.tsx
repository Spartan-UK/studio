"use client";

import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
