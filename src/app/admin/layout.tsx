
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
    // Don't do anything while auth state is loading
    if (loading) {
      return;
    }

    // If loading is finished and there's no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If the user exists but is not an admin, redirect to the main dashboard
    if (user.role !== 'admin') {
      router.push("/dashboard"); 
    }

  }, [user, loading, router]);

  // Show a loading skeleton while auth is loading or if the user is not yet determined to be an admin
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

  // If loading is complete and user is an admin, render the children
  return <>{children}</>;
}
