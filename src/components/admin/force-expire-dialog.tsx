
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";
import { updateDocumentNonBlocking, useFirebase } from "@/firebase";
import { doc, Timestamp } from "firebase/firestore";

interface ForceExpireDialogProps {
  visitorId: string;
  visitorName: string;
}

export function ForceExpireDialog({ visitorId, visitorName }: ForceExpireDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleExpire = async () => {
    if (!firestore) return;

    const visitorDoc = doc(firestore, "visitors", visitorId);
    
    // Set the timestamp to the Unix epoch (or any date in the past)
    const expiredTimestamp = new Timestamp(0, 0); 

    updateDocumentNonBlocking(visitorDoc, {
      inductionTimestamp: expiredTimestamp,
    });

    toast({
      variant: "success",
      title: "Induction Expired",
      description: `The induction for ${visitorName} has been manually expired.`,
    });

    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <History className="mr-2 h-3 w-3" />
          Force Expire
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately expire the site induction for <span className="font-semibold">{visitorName}</span>. They will be required to complete the induction on their next visit. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleExpire} className="bg-destructive hover:bg-destructive/90">
            Confirm and Expire
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
