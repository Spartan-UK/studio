"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Mock user for display purposes as auth is disabled
  const mockUser = {
      uid: 'mockuser',
      name: 'Development User',
      email: 'dev@spartan.com',
      role: 'root_admin' as const
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar user={mockUser} />
      </Sidebar>
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
