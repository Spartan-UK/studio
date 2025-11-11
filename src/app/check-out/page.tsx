
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  LogOut,
  Car,
  Clock,
  User,
  Phone,
  HardHat,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Visitor } from "@/lib/types";
import {
  useFirebase,
  useCollection,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from "@/firebase";
import { collection, query, where, doc, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckOutPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  // This query is now allowed for unauthenticated users by the new security rules
  const visitorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "visitors"),
            where("checkedOut", "==", false)
          )
        : null,
    [firestore]
  );
    
  const { data: checkedInUsers, isLoading } = useCollection<Visitor>(visitorsQuery);

  const handleCheckOut = (user: Visitor) => {
    if (!firestore || !user.id) return;

    const userDocRef = doc(firestore, "visitors", user.id);
    
    updateDocumentNonBlocking(userDocRef, {
      checkedOut: true,
      checkOutTime: Timestamp.now(),
    });

    toast({
      variant: "success",
      title: "Check-Out Successful",
      description: `Goodbye, ${user.name}!`,
    });
  };

  const renderUserDetails = (user: Visitor) => {
    if (user.type === 'visitor') {
      return (
        <>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>Visiting: {user.visiting}</span>
          </div>
          {user.vehicleReg && (
            <div className="flex items-center gap-3 text-sm">
              <Car className="h-4 w-4 text-gray-500" />
              <span>Reg: {user.vehicleReg}</span>
            </div>
          )}
        </>
      );
    } else { // Contractor
      return (
        <>
           <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>Contact: {user.personResponsible}</span>
          </div>
          {user.vehicleReg && (
            <div className="flex items-center gap-3 text-sm">
              <Car className="h-4 w-4 text-gray-500" />
              <span>Reg: {user.vehicleReg}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{user.phone}</span>
            </div>
          )}
        </>
      );
    }
  }

  const sortedUsers = useMemo(() => {
    return checkedInUsers?.sort((a, b) => {
        if (!a.checkInTime || !b.checkInTime) return 0;
        return b.checkInTime.toMillis() - a.checkInTime.toMillis()
    });
  }, [checkedInUsers]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background">
      <header className="w-full py-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">Check Out</h1>
        <p className="text-muted-foreground mt-2">Find your name below to check out.</p>
      </header>
      <main className="flex-1 flex flex-col items-center w-full max-w-6xl px-4 pb-8">

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-lg bg-gray-100">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sortedUsers && sortedUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {sortedUsers.map((user) => (
              <Card
                key={user.id}
                className="flex flex-col bg-gray-50 border-gray-200 shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-primary">{user.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {user.company}
                    </CardDescription>
                  </div>
                  {user.type === 'contractor' ? 
                    <HardHat className="w-6 h-6 text-gray-400" /> : 
                    <User className="w-6 h-6 text-gray-400" />
                  }
                </CardHeader>
                <CardContent className="space-y-3 pt-2 flex-grow text-foreground">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      Checked In:{" "}
                      {user.checkInTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {renderUserDetails(user)}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleCheckOut(user)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!sortedUsers || sortedUsers.length === 0) && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground">
              No one is currently checked in.
            </h2>
            <p className="text-gray-500 mt-2">
              When someone checks in, their details will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
