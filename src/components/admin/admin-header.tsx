import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const { isMobile } = useSidebar();
  
  return (
    <header className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6",
        isMobile && "h-auto py-2"
      )}>
      <SidebarTrigger className={cn(!isMobile && "hidden")} />
      
      <div className="flex-1">
        {/* Page title would go here */}
        <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
      </div>

      {/* Other header items like search or user menu can go here */}
    </header>
  );
}
