
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
  Home,
  LogIn,
  Settings,
  LayoutDashboard,
  Users,
  HardHat,
  Briefcase,
  Building,
  FileText,
} from "lucide-react";

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/visitors", label: "Visitor Log", icon: Users },
    { href: "/admin/contractors", label: "Contractors", icon: HardHat },
    { href: "/admin/employees", label: "Employees", icon: Briefcase },
    { href: "/admin/companies", label: "Companies", icon: Building },
    { href: "/admin/reports", label: "Reports", icon: FileText },
  ];

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">SPARTAN UK</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
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
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarMenu className="p-2">
        <SidebarMenuItem>
            <SidebarMenuButton
            asChild
            isActive={pathname === "/admin/settings"}
            tooltip={"Settings"}
            >
            <Link href="/admin/settings">
                <Settings />
                <span>Settings</span>
            </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarSeparator />

      <SidebarFooter>
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
      </SidebarFooter>
    </>
  );
}
