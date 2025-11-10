
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
import { format, addDays, differenceInDays } from 'date-fns';
import { useMemo } from "react";

const INDUCTION_VALIDITY_DAYS = 365;

export default function InductionLogPage() {
  const { firestore } = useFirebase();

  // Fetch all visitors, ordering by induction timestamp to help find the latest one.
  const visitorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "visitors"),
            orderBy("inductionTimestamp", "desc")
          )
        : null,
    [firestore]
  );

  const { data: allVisitors, isLoading } = useCollection<Visitor>(visitorsQuery);

  // De-duplicate records to show only the most recent induction for each person.
  const uniqueInductionRecords = useMemo(() => {
    if (!allVisitors) return [];
    
    // Filter for records that actually have an induction.
    const inductionRecords = allVisitors.filter(
      (visitor) => visitor.inductionComplete && visitor.inductionTimestamp
    );

    const uniqueRecords = new Map<string, Visitor>();

    for (const record of inductionRecords) {
      const uniqueKey = `${record.name?.toLowerCase()}-${record.company?.toLowerCase()}`;
      // Since the query is ordered by `inductionTimestamp` descending, the first
      // record we encounter for a unique key is the most recent one.
      if (!uniqueRecords.has(uniqueKey)) {
        uniqueRecords.set(uniqueKey, record);
      }
    }

    return Array.from(uniqueRecords.values());
  }, [allVisitors]);

  const getExpiryInfo = (inductionTimestamp: any) => {
    if (!inductionTimestamp) {
        return {
            expiryDate: 'N/A',
            daysRemaining: null,
            badgeVariant: 'secondary' as const,
        };
    }
    const inductionDate = inductionTimestamp.toDate();
    const expiryDate = addDays(inductionDate, INDUCTION_VALIDITY_DAYS);
    const daysRemaining = differenceInDays(expiryDate, new Date());

    let badgeVariant: "success" | "destructive" | "secondary" = "success";
    if (daysRemaining < 0) {
      badgeVariant = "destructive";
    } else if (daysRemaining < 30) {
      badgeVariant = "secondary";
    }

    return {
      expiryDate: format(expiryDate, 'MMM d, yyyy'),
      daysRemaining,
      badgeVariant,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Induction Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Last Induction Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading induction records...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              uniqueInductionRecords.map((record) => {
                const { expiryDate, daysRemaining, badgeVariant } = getExpiryInfo(record.inductionTimestamp);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.company}</TableCell>
                    <TableCell>{record.inductionTimestamp ? format(record.inductionTimestamp.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                    <TableCell>{expiryDate}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={badgeVariant} className={
                        daysRemaining === null ? 'bg-gray-400' :
                        badgeVariant === 'success' ? 'bg-green-500 hover:bg-green-600' : 
                        badgeVariant === 'secondary' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-500 hover:bg-red-600'
                       }>
                        {daysRemaining === null ? 'Unknown' : daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                       </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            {!isLoading && !uniqueInductionRecords.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No induction records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
