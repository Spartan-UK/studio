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
} from "lucide-react";
import { SpartanIcon } from "../icons";

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <SpartanIcon className="h-8 w-8" />
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
