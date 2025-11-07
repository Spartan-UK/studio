
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
import { Pencil } from "lucide-react";
import { updateDocumentNonBlocking, useFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Company } from "@/lib/types";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface EditCompanyDialogProps {
  company: Company;
}

export function EditCompanyDialog({ company }: EditCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name,
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    if (!firestore || !company.id) return;

    const companyDoc = doc(firestore, "companies", company.id);
    updateDocumentNonBlocking(companyDoc, { name: values.name });

    toast({
      variant: "success",
      title: "Company Updated",
      description: `The company name has been updated to ${values.name}.`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Company</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the name of the company. Click save when you're done.
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
