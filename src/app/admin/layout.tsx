
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const publicAdminPages = [
    "/admin/dashboard",
    "/admin/visitors",
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
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
        const isAdmin = user.role === 'root_admin' || user.role === 'admin';
        const isPublicPage = publicAdminPages.some(page => pathname.startsWith(page));

        if (!isAdmin && !isPublicPage) {
            router.push("/admin/dashboard"); // Redirect non-admins from protected pages
        }
    }
  }, [user, loading, router, pathname]);

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

  return <>{children}</>;
}
