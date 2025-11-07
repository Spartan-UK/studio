"use client";

import { AddCompanyDialog } from "@/components/admin/add-company-dialog";
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
import { Company } from "@/lib/types";
import { collection } from "firebase/firestore";

export default function CompaniesPage() {
  const { firestore } = useFirebase();

  const companiesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, "companies") : null),
    [firestore]
  );

  const { data: companies, isLoading } = useCollection<Company>(companiesCol);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Companies</CardTitle>
        <AddCompanyDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell className="text-center">Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading &&
              companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                </TableRow>
              ))}
            {!isLoading && !companies?.length && (
              <TableRow>
                <TableCell className="text-center">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
