import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main/main-sidebar';
import { MainHeader } from '@/components/main/main-header';

export const metadata: Metadata = {
  title: 'Spartan Check-In',
  description: 'Visitor and contractor management for Spartan IT.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SidebarProvider>
            <Sidebar>
              <MainSidebar />
            </Sidebar>
            <SidebarInset>
              <MainHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
