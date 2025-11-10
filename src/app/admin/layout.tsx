
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth loading is complete before checking permissions
    if (loading) {
      return;
    }

    // If there is no user, redirect to login for any page under /admin
    if (!user) {
      // Allow access to login page itself to prevent redirect loops
      if (pathname !== '/login') {
         router.push("/login");
      }
      return;
    }

    // Define admin-only pages
    const adminOnlyPages = [
        "/admin/induction-log",
        "/admin/users",
        "/admin/employees",
        "/admin/companies",
        "/admin/reports",
        "/admin/settings",
    ];

    // Check if the current page requires admin role
    const isPageAdminOnly = adminOnlyPages.some(page => pathname.startsWith(page));

    // If the page requires admin role and the user is not an admin, redirect
    if (isPageAdminOnly && user.role !== 'admin') {
      router.push("/admin/dashboard"); // Redirect non-admins
    }

  }, [user, loading, router, pathname]);

  // While loading or if user is null (and redirect is pending), show a loading UI.
  // This is the critical change: Do not render `children` until user is confirmed.
  if (loading || !user) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    );
  }

  // Once loading is false AND user exists, render the page.
  return <>{children}</>;
}
