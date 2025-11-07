
"use client";

import { AddEmployeeDialog } from "@/components/admin/add-employee-dialog";
import { DeleteEmployeeDialog } from "@/components/admin/delete-employee-dialog";
import { EditEmployeeDialog } from "@/components/admin/edit-employee-dialog";
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
import { Employee } from "@/lib/types";
import { collection } from "firebase/firestore";

export default function EmployeesPage() {
  const { firestore } = useFirebase();

  const employeesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "employees") : null),
    [firestore]
  );

  const { data: employees, isLoading } = useCollection<Employee>(employeesCol);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Employees</CardTitle>
        <AddEmployeeDialog />
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
              employees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.displayName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <EditEmployeeDialog employee={employee} />
                    <DeleteEmployeeDialog employeeId={employee.id!} employeeName={employee.displayName} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !employees?.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
