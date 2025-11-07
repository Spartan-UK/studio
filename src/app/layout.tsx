"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { FirebaseClientProvider } from "@/firebase/client-provider";

/*
export const metadata: Metadata = {
  title: 'Spartan Check-In',
  description: 'Visitor and contractor management for Spartan IT.',
};
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mock user for display purposes as auth is disabled
  const mockUser = {
    uid: "mockuser",
    name: "Development User",
    email: "dev@spartan.com",
    role: "root_admin" as const,
  };

  return (
    <html lang="en">
      <head>
        <title>Spartan Check-In</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <SidebarProvider>
              <Sidebar>
                <AdminSidebar user={mockUser} />
              </Sidebar>
              <SidebarInset>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
