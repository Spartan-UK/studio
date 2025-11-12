
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  Building,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UserPlus,
  LogIn,
  ClipboardCheck,
  User,
  Shield,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const menuItems = [
    { href: "/", label: "Check In", icon: UserPlus, adminOnly: false },
    { href: "/check-out", label: "Check Out", icon: LogOut, adminOnly: false },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { href: "/activity-log", label: "Activity Log", icon: FileText, adminOnly: false },
    { href: "/induction-log", label: "Induction Log", icon: ClipboardCheck, adminOnly: false },
    { href: "/users", label: "Users", icon: Users, adminOnly: true },
    { href: "/admin/employees", label: "Employees", icon: User, adminOnly: true },
    { href: "/admin/companies", label: "Companies", icon: Building, adminOnly: true },
  ];

  const isAdmin = user?.role === 'admin';

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.adminOnly) {
      return true;
    }
    return isAdmin;
  });


  return (
    <>
      <SidebarHeader className="p-4 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider">SPARTAN UK</h1>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
            {isAdmin && (
              <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Settings" isActive={pathname.startsWith("/admin/settings")}>
                      <Link href="/admin/settings">
                          <Settings />
                          <span>Settings</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Privacy Policy" isActive={pathname === "/privacy-policy"}>
                    <Link href="/privacy-policy">
                        <Shield />
                        <span>Privacy Policy</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarSeparator />

        {user ? (
            <>
                <div className="flex flex-col overflow-hidden p-2">
                    <span className="font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-sidebar-foreground/80 truncate">{user.email}</span>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => logout()} tooltip="Log Out">
                        <LogOut />
                        <span>Log Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </>
        ) : !loading && (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Admin Login">
                        <Link href="/login">
                            <LogIn />
                            <span>Login</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
      </SidebarFooter>
    </>
  );
}
