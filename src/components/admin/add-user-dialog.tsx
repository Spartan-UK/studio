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
import { PlusCircle } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
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
  emailUsername: z.string(),
  emailDomain: z.string().min(1, "Please select a domain"),
});

type UserFormValues = z.infer<typeof userSchema>;

const formatName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      emailUsername: "",
      emailDomain: emailDomains[0],
    },
  });

  const { watch, setValue } = form;
  const firstName = watch("firstName");
  const surname = watch("surname");

  useEffect(() => {
    const username = `${firstName || ""}.${surname || ""}`.toLowerCase().replace(/\s+/g, '');
    setValue("emailUsername", username);
  }, [firstName, surname, setValue]);

  const onSubmit = async (values: UserFormValues) => {
    if (!firestore) return;

    try {
      const formattedFirstName = formatName(values.firstName);
      const formattedSurname = formatName(values.surname);

      const finalEmail = `${values.emailUsername}${values.emailDomain}`;
      
      if (!z.string().email().safeParse(finalEmail).success) {
          toast({
              variant: "destructive",
              title: "Invalid Email",
              description: "The generated email address is not valid.",
          });
          return;
      }

      const newUser = {
        firstName: formattedFirstName,
        surname: formattedSurname,
        displayName: `${formattedFirstName} ${formattedSurname}`,
        email: finalEmail,
      };

      const usersCol = collection(firestore, "users");
      await addDoc(usersCol, newUser);

      toast({
        variant: "success",
        title: "User Added",
        description: `${newUser.displayName} has been added to the system.`,
      });

      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Error adding user: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not add user. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user. The email will be auto-generated.
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
                        <Input placeholder="john.doe" {...field} readOnly className="bg-muted"/>
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
                        defaultValue={field.value}
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
              <Button type="submit">Save User</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
