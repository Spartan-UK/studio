"use client";

import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        <SidebarProvider>
          <Sidebar>
            <AdminSidebar />
          </Sidebar>
          <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
