
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
import { Trash2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { Visitor } from "@/lib/types";

interface ClearLogsDialogProps {
  logs: Visitor[];
}

export function ClearLogsDialog({ logs }: ClearLogsDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!firestore) return;

    setIsClearing(true);

    try {
        const batch = writeBatch(firestore);
        logs.forEach(log => {
            if(log.id) {
                const logRef = doc(firestore, 'visitors', log.id);
                batch.delete(logRef);
            }
        });
        await batch.commit();

        toast({
            variant: "success",
            title: "Activity Log Cleared",
            description: `All ${logs.length} entries have been deleted.`,
        });
    } catch (error) {
        console.error("Error clearing logs: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear all log entries. Please try again.",
        });
    }


    setIsClearing(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Logs
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all <span className="font-semibold">{logs.length}</span> activity log entries from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClear} disabled={isClearing} className="bg-destructive hover:bg-destructive/90">
             {isClearing ? 'Clearing...' : 'Yes, delete all'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
