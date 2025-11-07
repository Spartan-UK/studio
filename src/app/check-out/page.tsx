
"use client";

import { useState } from "react";
import Link from "next/link";
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

  const { data: checkedInUsers, isLoading } = useCollection<Visitor>(
    visitorsQuery
  );

  const handleCheckOut = (visitor: Visitor) => {
    if (!firestore || !visitor.id) return;

    const visitorDocRef = doc(firestore, "visitors", visitor.id);
    updateDocumentNonBlocking(visitorDocRef, {
      checkedOut: true,
      checkOutTime: Timestamp.now(),
    });

    toast({
      variant: "success",
      title: "Check-Out Successful",
      description: `Goodbye, ${visitor.name}!`,
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white w-full p-4">
      <main className="flex-1 flex flex-col items-center w-full max-w-6xl pt-10">

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

        {!isLoading && checkedInUsers && checkedInUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {checkedInUsers.map((user) => (
              <Card
                key={user.id}
                className="flex flex-col bg-gray-50 border-gray-200 shadow-md"
              >
                <CardHeader>
                  <div>
                    <CardTitle className="text-lg text-red-600">{user.name}</CardTitle>
                    <CardDescription className="text-red-500">
                      {user.company}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 flex-grow text-black">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      Checked In:{" "}
                      {user.checkInTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
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
                  {user.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
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

        {!isLoading && (!checkedInUsers || checkedInUsers.length === 0) && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-black">
              No one is currently checked in.
            </h2>
            <p className="text-gray-500 mt-2">
              When a visitor checks in, their details will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
