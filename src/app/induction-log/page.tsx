
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
import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { Visitor } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format, addDays, differenceInDays, isBefore } from 'date-fns';
import { useMemo } from "react";
import { ForceExpireDialog } from "@/components/admin/force-expire-dialog";

const INDUCTION_VALIDITY_DAYS = 365;

export default function InductionLogPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();

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

  const uniqueInductionRecords = useMemo(() => {
    if (!allVisitors) return [];
    
    const inductionRecords = allVisitors.filter(
      (visitor) => visitor.inductionComplete && visitor.inductionTimestamp
    );

    const uniqueRecords = new Map<string, Visitor>();

    for (const record of inductionRecords) {
      const uniqueKey = `${record.name?.toLowerCase()}-${record.company?.toLowerCase()}`;
      if (!uniqueRecords.has(uniqueKey)) {
        uniqueRecords.set(uniqueKey, record);
      }
    }

    return Array.from(uniqueRecords.values());
  }, [allVisitors]);

  const getExpiryInfo = (record: Visitor) => {
    if (!record.inductionTimestamp) {
        return {
            expiryDate: 'N/A',
            daysRemaining: null,
            badgeVariant: 'secondary' as const,
            isExpired: true,
        };
    }

    if (record.inductionValid === false) {
      return {
        expiryDate: 'Expired',
        daysRemaining: -1,
        badgeVariant: 'destructive' as const,
        isExpired: true,
      };
    }

    const inductionDate = record.inductionTimestamp.toDate();
    const expiryDate = addDays(inductionDate, INDUCTION_VALIDITY_DAYS);
    const daysRemaining = differenceInDays(expiryDate, new Date());
    const isExpired = isBefore(expiryDate, new Date());

    let badgeVariant: "success" | "destructive" | "secondary" = "success";
    if (isExpired) {
      badgeVariant = "destructive";
    } else if (daysRemaining < 30) {
      badgeVariant = "secondary";
    }

    return {
      expiryDate: format(expiryDate, 'MMM d, yyyy'),
      daysRemaining,
      badgeVariant,
      isExpired,
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
              <TableHead>Status</TableHead>
              {user && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={user ? 6 : 5} className="h-24 text-center">
                  Loading induction records...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              uniqueInductionRecords.map((record) => {
                const { expiryDate, daysRemaining, badgeVariant, isExpired } = getExpiryInfo(record);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.company}</TableCell>
                    <TableCell>{record.inductionTimestamp ? format(record.inductionTimestamp.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
                    <TableCell>{expiryDate}</TableCell>
                    <TableCell>
                       <Badge variant={badgeVariant} className={
                        badgeVariant === 'success' ? 'bg-green-500 hover:bg-green-600' : 
                        badgeVariant === 'secondary' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-500 hover:bg-red-600'
                       }>
                        {record.inductionValid === false ? 'Expired' : (daysRemaining === null ? 'Unknown' : isExpired ? 'Expired' : `${daysRemaining} days`)}
                       </Badge>
                    </TableCell>
                    {user && (
                      <TableCell className="text-right">
                        {record.id && !isExpired && record.inductionValid !== false && (
                          <ForceExpireDialog 
                            visitorId={record.id} 
                            visitorName={record.name} 
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            {!isLoading && !uniqueInductionRecords.length && (
              <TableRow>
                <TableCell colSpan={user ? 6 : 5} className="h-24 text-center">
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
