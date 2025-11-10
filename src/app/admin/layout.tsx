
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// List of pages that are public (don't require any login)
const publicPages = [
    "/admin/dashboard",
    "/admin/visitors",
];

// List of pages that require an *admin* role
const adminOnlyPages = [
    "/admin/induction-log",
    "/admin/users",
    "/admin/employees",
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

  // Determine if the current page is one of the designated public pages
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));

  // Determine if the page requires admin role
  const isPageAdminOnly = adminOnlyPages.some(page => pathname.startsWith(page));

  // Determine if the page is a protected page (i.e., not public)
  const isPageProtected = !isPublicPage;

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
