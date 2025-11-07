
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
  FileText,
  HardHat,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Home,
} from "lucide-react";
import { SpartanIcon } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AdminSidebarProps {
  user: User;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/", label: "Home", icon: Home, adminOnly: false },
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
    { href: "/admin/visitors", label: "Visitor Log", icon: Users, adminOnly: false },
    { href: "/admin/contractors", label: "Contractors", icon: HardHat, adminOnly: true },
    { href: "/admin/employees", label: "Employees", icon: Briefcase, adminOnly: true },
    { href: "/admin/companies", label: "Companies", icon: Building, adminOnly: true },
    { href: "/admin/reports", label: "Reports", icon: FileText, adminOnly: true },
    { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  ];

  const isAdmin = user?.role === 'root_admin' || user?.role === 'admin';

  return (
    <>
      <SidebarHeader>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) {
              return null;
            }
            return (
              <SidebarMenuItem key={item.href}>
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
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.uid}`} alt={user.name || "User"} />
            <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold truncate">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/80 truncate">{user.email}</span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()} tooltip="Log Out">
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
