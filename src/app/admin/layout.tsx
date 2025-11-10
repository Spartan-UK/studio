
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// List of admin pages that are NOT accessible to non-admin users
const protectedAdminPages = [
    "/admin/contractors",
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

  useEffect(() => {
    // Wait until the loading is complete
    if (loading) {
      return;
    }

    // If loading is done and there's no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If user is loaded, check their role
    const isAdmin = user.role === 'admin';
    const isProtectedPage = protectedAdminPages.some(page => pathname.startsWith(page));

    // If a non-admin tries to access a protected admin page, redirect them.
    if (!isAdmin && isProtectedPage) {
        router.push("/admin/dashboard");
    }
  }, [user, loading, router, pathname]);

  // Show a loading skeleton while auth state is being determined
  if (loading || !user) {
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

  // If user is loaded and authorized, render the children (the page)
  return <>{children}</>;
}
