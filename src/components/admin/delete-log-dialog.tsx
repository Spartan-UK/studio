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
import { doc, deleteDoc } from "firebase/firestore";
import { Visitor } from "@/lib/types";

interface DeleteLogDialogProps {
  log: Visitor;
}

export function DeleteLogDialog({ log }: DeleteLogDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleDelete = async () => {
    if (!firestore || !log.id) return;

    try {
      const logDoc = doc(firestore, "visitors", log.id);
      await deleteDoc(logDoc);

      toast({
        variant: "success",
        title: "Log Entry Deleted",
        description: `The log for ${log.name} has been removed.`,
      });

      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting log entry: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete log entry. Please try again.",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete Log Entry</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the activity log for <span className="font-semibold">{log.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
