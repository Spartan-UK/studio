
"use client";

import { useAuth } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== 'admin') {
      router.push("/dashboard"); 
    }

  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
        <div className="space-y-6">
            <Skeleton className="h-96" />
        </div>
    );
  }

  return <>{children}</>;
}
