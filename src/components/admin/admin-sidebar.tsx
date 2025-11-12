
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
  Building,
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { Skeleton } from "../ui/skeleton";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const isLoggedIn = !!user;

  const publicMenuItems = [
    { href: "/", label: "Check In", icon: UserPlus },
    { href: "/check-out", label: "Check Out", icon: LogOut },
    { href: "/activity-log", label: "Activity Log", icon: FileText },
    { href: "/induction-log", label: "Induction Log", icon: ClipboardCheck },
  ];

  const loggedInMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/admin/employees", label: "Employees", icon: User },
    { href: "/admin/companies", label: "Companies", icon: Building },
  ];

  if (loading) {
    return (
        <>
            <SidebarHeader className="p-4 text-center">
                <h1 className="text-xl font-bold uppercase tracking-wider">SPARTAN UK</h1>
            </SidebarHeader>
            <SidebarContent className="p-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </SidebarContent>
        </>
    )
  }

  return (
    <>
      <SidebarHeader className="p-4 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider">SPARTAN UK</h1>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {publicMenuItems.map((item) => (
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
          ))}
          {isLoggedIn && loggedInMenuItems.map((item) => (
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
            {isLoggedIn && (
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
                    <span className="font-semibold truncate text-sm">{user.email}</span>
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
        ) : (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Admin Login" isActive={pathname === "/login"}>
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
