
"use client";

import { useFirebase, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until Firebase has finished checking the auth state.
    if (isUserLoading) {
      return;
    }
    // If the check is complete and there's still no user, redirect.
    if (!user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // While checking the auth state, or if there's no user (and redirect is imminent),
  // show a consistent loading skeleton.
  if (isUserLoading || !user) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-96" />
        </div>
    );
  }

  // Once loading is complete and we have a user, render the children.
  return <>{children}</>;
}
