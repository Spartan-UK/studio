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
import { Visitor } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function VisitorsPage() {
  const { firestore } = useFirebase();

  const visitorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "visitors"), orderBy("checkInTime", "desc"))
        : null,
    [firestore]
  );

  const { data: visitors, isLoading } = useCollection<Visitor>(visitorsQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy, h:mm a');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Visiting</TableHead>
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
              visitors?.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">{visitor.name}</TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell>{visitor.visiting}</TableCell>
                  <TableCell>{formatDate(visitor.checkInTime)}</TableCell>
                  <TableCell>{visitor.checkOutTime ? formatDate(visitor.checkOutTime) : 'N/A'}</TableCell>
                  <TableCell>
                    {visitor.checkedOut ? (
                      <Badge variant="secondary">Checked Out</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Checked In</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !visitors?.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No visitor records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
