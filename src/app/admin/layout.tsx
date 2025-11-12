
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
    // If auth state is still loading, don't do anything.
    if (loading) {
      return;
    }

    // If loading is finished and there's no user, redirect to login.
    if (!user) {
      router.push("/login");
    }

  }, [user, loading, router]);

  // While loading, or if there's no user (and redirect is in progress), show a skeleton.
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

  // If loading is complete and a user exists, render the children.
  return <>{children}</>;
}
