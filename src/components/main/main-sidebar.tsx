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
  LogOut,
  UserPlus,
} from "lucide-react";
import { SpartanIcon } from "@/components/icons";

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/check-in/visitor", label: "Check-In", icon: UserPlus },
    { href: "/check-out", label: "Check-Out", icon: LogOut },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SpartanIcon className="w-8 h-8 text-primary" />
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
