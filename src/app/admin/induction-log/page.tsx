
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
import { collection, query, where, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format, addDays, differenceInDays } from 'date-fns';

const INDUCTION_VALIDITY_DAYS = 365;

export default function InductionLogPage() {
  const { firestore } = useFirebase();

  const contractorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "visitors"),
            where("type", "==", "contractor"),
            where("inductionComplete", "==", true),
            orderBy("inductionTimestamp", "desc")
          )
        : null,
    [firestore]
  );

  const { data: contractors, isLoading } = useCollection<Visitor>(contractorsQuery);

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
              <TableHead>Induction Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Days Remaining</TableHead>
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
              contractors?.map((contractor) => {
                const { expiryDate, daysRemaining, badgeVariant } = getExpiryInfo(contractor.inductionTimestamp);
                return (
                  <TableRow key={contractor.id}>
                    <TableCell className="font-medium">{contractor.name}</TableCell>
                    <TableCell>{contractor.company}</TableCell>
                    <TableCell>{contractor.inductionTimestamp ? format(contractor.inductionTimestamp.toDate(), 'MMM d, yyyy') : 'N/A'}</TableCell>
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
            {!isLoading && !contractors?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No contractor induction records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
