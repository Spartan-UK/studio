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

interface DeleteCompanyDialogProps {
  companyId: string;
  companyName: string;
}

export function DeleteCompanyDialog({ companyId, companyName }: DeleteCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleDelete = async () => {
    if (!firestore) return;

    try {
      const companyDoc = doc(firestore, "companies", companyId);
      await deleteDoc(companyDoc);

      toast({
        variant: "success",
        title: "Company Deleted",
        description: `${companyName} has been removed from the system.`,
      });

      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting company: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete company. Please try again.",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete Company</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the company record for <span className="font-semibold">{companyName}</span>.
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
