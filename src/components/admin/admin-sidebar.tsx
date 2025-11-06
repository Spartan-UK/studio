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
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/visitors", label: "Visitors", icon: Users },
    { href: "/admin/contractors", label: "Contractors", icon: HardHat },
    { href: "/admin/employees", label: "Employees", icon: Briefcase },
    { href: "/admin/companies", label: "Companies", icon: Building },
    { href: "/admin/reports", label: "Reports", icon: FileText },
  ];

  if (user?.role === 'root_admin') {
    menuItems.push({ href: "/admin/settings", label: "Settings", icon: Settings });
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SpartanIcon className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold">Spartan Check-In</span>
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
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.uid}`} alt={user.name || "User"} />
            <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
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
