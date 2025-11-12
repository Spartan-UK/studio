
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth loading is complete before checking permissions
    if (loading) {
      return;
    }

    // If there is no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If the user is not an admin, redirect them away from the admin section
    if (user.role !== 'admin') {
      router.push("/dashboard"); 
    }

  }, [user, loading, router]);

  // While loading or if user is not an admin (and redirect is pending), show a loading UI.
  if (loading || !user || user.role !== 'admin') {
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

  return <>{children}</>;
}
