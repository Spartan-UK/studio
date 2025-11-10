
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// List of pages that require any login
const authenticatedPages = [
    "/admin/contractors",
    "/admin/induction-log",
    "/admin/users",
    "/admin/companies",
    "/admin/reports",
    "/admin/settings",
];

// List of pages that require an *admin* role
const adminOnlyPages = [
    "/admin/contractors",
    "/admin/induction-log",
    "/admin/users",
    "/admin/companies",
    "/admin/reports",
    "/admin/settings",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPageProtected = authenticatedPages.some(page => pathname.startsWith(page));
  const isPageAdminOnly = adminOnlyPages.some(page => pathname.startsWith(page));

  useEffect(() => {
    // Wait until auth loading is complete before checking permissions
    if (loading) {
      return;
    }

    // If the page is protected and there's no user, redirect to login
    if (isPageProtected && !user) {
      router.push("/login");
      return;
    }

    // If the page requires admin role and the user is not an admin, redirect
    if (user && isPageAdminOnly && user.role !== 'admin') {
      router.push("/admin/dashboard"); // Redirect non-admins from admin-only pages
    }

  }, [user, loading, router, pathname, isPageProtected, isPageAdminOnly]);

  // Show a loading skeleton only for protected pages while auth state is being determined
  if (isPageProtected && (loading || !user)) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-96" />
        </div>
    );
  }

  // Render the children (the page) for public pages or authorized users
  return <>{children}</>;
}
