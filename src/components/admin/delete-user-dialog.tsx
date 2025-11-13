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

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
}

export function DeleteUserDialog({ userId, userName }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleDelete = async () => {
    if (!firestore) return;

    try {
      const userDoc = doc(firestore, "users", userId);
      await deleteDoc(userDoc);

      toast({
        variant: "success",
        title: "User Deleted",
        description: `${userName} has been removed from the system.`,
      });

      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting user: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete user. Please try again.",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete User</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user record for <span className="font-semibold">{userName}</span>.
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
