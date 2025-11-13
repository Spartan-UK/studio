
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function AddCompanyDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    if (!firestore) return;

    try {
      const companiesCol = collection(firestore, "companies");
      await addDoc(companiesCol, { name: values.name });

      toast({
        variant: "success",
        title: "Company Added",
        description: `${values.name} has been added to the system.`,
      });

      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding company: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not add company. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Enter the name of the new company. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Company</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
