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
import { Visitor, Contractor } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { HardHat, User } from "lucide-react";

type LogEntry = (Visitor | Contractor) & { type: 'visitor' | 'contractor' };

export default function VisitorsPage() {
  const { firestore } = useFirebase();
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const visitorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "visitors"), orderBy("checkInTime", "desc"))
        : null,
    [firestore]
  );
  const { data: visitors, isLoading: isLoadingVisitors } = useCollection<Visitor>(visitorsQuery);

  const contractorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "contractors"), orderBy("checkInTime", "desc"))
        : null,
    [firestore]
  );
  const { data: contractors, isLoading: isLoadingContractors } = useCollection<Contractor>(contractorsQuery);
  
  const isLoading = isLoadingVisitors || isLoadingContractors;

  useEffect(() => {
    const visitorsWithTypes = (visitors || []).map(v => ({ ...v, type: 'visitor' as const }));
    const contractorsWithTypes = (contractors || []).map(c => ({ ...c, type: 'contractor' as const }));
    
    const allEntries = [...visitorsWithTypes, ...contractorsWithTypes];
    allEntries.sort((a, b) => b.checkInTime.toMillis() - a.checkInTime.toMillis());

    setLogEntries(allEntries);

  }, [visitors, contractors]);


  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy, h:mm a');
  };

  const renderContactPerson = (entry: LogEntry) => {
    if (entry.type === 'visitor') {
      return entry.visiting;
    }
    return entry.personResponsible;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              logEntries.map((entry) => (
                <TableRow key={`${entry.type}-${entry.id}`}>
                  <TableCell>
                    {entry.type === 'visitor' ? (
                       <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                         <User className="h-3.5 w-3.5" />
                         Visitor
                       </Badge>
                    ) : (
                       <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                         <HardHat className="h-3.5 w-3.5" />
                         Contractor
                       </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>{entry.company}</TableCell>
                  <TableCell>{renderContactPerson(entry)}</TableCell>
                  <TableCell>{formatDate(entry.checkInTime)}</TableCell>
                  <TableCell>{entry.checkOutTime ? formatDate(entry.checkOutTime) : 'N/A'}</TableCell>
                  <TableCell>
                    {entry.checkedOut ? (
                      <Badge variant="secondary">Checked Out</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Checked In</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !logEntries.length && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No activity records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
