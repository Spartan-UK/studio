
"use client";

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
import { Contractor } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function ContractorsPage() {
  const { firestore } = useFirebase();

  const contractorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "contractors"), orderBy("checkInTime", "desc"))
        : null,
    [firestore]
  );

  const { data: contractors, isLoading } = useCollection<Contractor>(contractorsQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy, h:mm a');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contractors Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Check-In Time</TableHead>
              <TableHead>Check-Out Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              contractors?.map((contractor) => (
                <TableRow key={contractor.id}>
                  <TableCell className="font-medium">{contractor.name}</TableCell>
                  <TableCell>{contractor.company}</TableCell>
                  <TableCell>{contractor.personResponsible}</TableCell>
                  <TableCell>{formatDate(contractor.checkInTime)}</TableCell>
                  <TableCell>{contractor.checkOutTime ? formatDate(contractor.checkOutTime) : 'N/A'}</TableCell>
                  <TableCell>
                    {contractor.checkedOut ? (
                      <Badge variant="secondary">Checked Out</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Checked In</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !contractors?.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No contractor records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
