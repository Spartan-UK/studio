"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { SpartanIcon } from "../icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const getTitleFromPathname = (pathname: string) => {
  if (pathname.startsWith("/check-in")) return "Check-In";
  if (pathname.startsWith("/check-out")) return "Check-Out";
  if (pathname.startsWith("/admin")) return "Admin";
  return "Home";
}

export function MainHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);
  
  return (
    <header className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6",
        isMobile && "h-auto py-2"
      )}>
      <SidebarTrigger className={cn(!isMobile && "hidden")} />
      
       <Link href="/" className="flex items-center gap-2 md:hidden">
          <SpartanIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Spartan</span>
        </Link>
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
      </div>
    </header>
  );
}
