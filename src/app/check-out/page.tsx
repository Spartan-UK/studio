
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LogOut,
  Car,
  Clock,
  User,
  Phone,
  HardHat,
  Building,
  Construction,
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
import { Badge } from "@/components/ui/badge";

export default function CheckOutPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [userToCheckout, setUserToCheckout] = useState<Visitor | null>(null);

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
    setUserToCheckout(null);
  };

  const renderUserDetails = (user: Visitor) => {
    if (user.type === 'visitor') {
      return (
        <>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>Visiting: {user.visiting}</span>
          </div>
          {user.visitType && (
             <div className="flex items-center gap-3 text-sm">
              {user.visitType === 'site' ? <Construction className="h-4 w-4 text-gray-500" /> : <Building className="h-4 w-4 text-gray-500" />}
              <span>{user.visitType.charAt(0).toUpperCase() + user.visitType.slice(1)} Visit</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{user.phone}</span>
            </div>
          )}
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
    <>
      <div className="flex flex-col items-center w-full min-h-screen bg-background">
        <header className="w-full py-8 max-w-7xl px-4">
          <h1 className="text-4xl font-bold text-destructive">Check Out</h1>
        </header>
        <main className="flex-1 flex flex-col items-center w-full max-w-7xl px-4 pb-8">

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="shadow-lg bg-gray-100">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
                      <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                        <HardHat className="h-3.5 w-3.5" />
                        Contractor
                      </Badge> : 
                      <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                        <User className="h-3.5 w-3.5" />
                        Visitor
                      </Badge>
                    }
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2 flex-grow text-foreground">
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
                      onClick={() => setUserToCheckout(user)}
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
      <AlertDialog open={!!userToCheckout} onOpenChange={(isOpen) => !isOpen && setUserToCheckout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to check out <span className="font-bold">{userToCheckout?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToCheckout(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => userToCheckout && handleCheckOut(userToCheckout)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
