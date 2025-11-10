
"use client";

import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { User } from "@/lib/types";
import { collection } from "firebase/firestore";

export default function UsersPage() {
  const { firestore } = useFirebase();

  const usersCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "users") : null),
    [firestore]
  );

  const { data: users, isLoading } = useCollection<User>(usersCol);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Users</CardTitle>
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.displayName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <EditUserDialog user={user} />
                    <DeleteUserDialog userId={user.id!} userName={user.displayName} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !users?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
