
"use client";

import { useState, useEffect } from "react";
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
import { User } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailDomains = [
  "@spartanuk.co.uk",
  "@metinvestholding.com",
  "@metinvest-westerneurope.com",
];

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  emailUsername: z.string().min(1, "Email username is required"),
  emailDomain: z.string().min(1, "Please select a domain"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  user: User;
}

const formatName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const getEmailParts = (email: string) => {
    for (const domain of emailDomains) {
      if (email.endsWith(domain)) {
        return {
          username: email.slice(0, -domain.length),
          domain: domain,
        };
      }
    }
    const atIndex = email.lastIndexOf('@');
    if (atIndex !== -1) {
      return {
        username: email.substring(0, atIndex),
        domain: email.substring(atIndex),
      }
    }
    return { username: email, domain: "" };
  };

  const emailParts = getEmailParts(user.email);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user.firstName,
      surname: user.surname,
      emailUsername: emailParts.username,
      emailDomain: emailParts.domain,
    },
  });

  const { watch, setValue } = form;
  const firstName = watch("firstName");
  const surname = watch("surname");

  useEffect(() => {
    if (form.formState.isDirty) {
        const username = `${firstName || ""}.${surname || ""}`.toLowerCase().replace(/\s+/g, '');
        setValue("emailUsername", username, { shouldValidate: true });
    }
  }, [firstName, surname, setValue, form.formState.isDirty]);

  const onSubmit = async (values: UserFormValues) => {
    if (!firestore || !user.id) return;

    const formattedFirstName = formatName(values.firstName);
    const formattedSurname = formatName(values.surname);
    const finalEmail = `${values.emailUsername}${values.emailDomain}`;

    const updatedUser = {
      firstName: formattedFirstName,
      surname: formattedSurname,
      displayName: `${formattedFirstName} ${formattedSurname}`,
      email: finalEmail,
    };

    const userDoc = doc(firestore, "users", user.id);
    updateDocumentNonBlocking(userDoc, updatedUser);

    toast({
      variant: "success",
      title: "User Updated",
      description: `${updatedUser.displayName}'s details have been updated.`,
    });
    
    setOpen(false);
  };
  
  useEffect(() => {
    if (!open) {
      form.reset();
    } else {
      const parts = getEmailParts(user.email);
      form.reset({
        firstName: user.firstName,
        surname: user.surname,
        emailUsername: parts.username,
        emailDomain: parts.domain,
      });
    }
  }, [open, user, form]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the details for the user. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Email</FormLabel>
              <div className="flex items-center gap-1">
                <FormField
                  control={form.control}
                  name="emailUsername"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="john.doe" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailDomain"
                  render={({ field }) => (
                    <FormItem className="w-auto">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emailDomains.map((domain) => (
                            <SelectItem key={domain} value={domain}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
