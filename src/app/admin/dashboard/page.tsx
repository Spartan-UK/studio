
"use client";

import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, HardHat, LogIn, Clock } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { Visitor, Contractor } from "@/lib/types";
import { collection, query, where, orderBy, Timestamp, limit } from "firebase/firestore";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { firestore } = useFirebase();

  const todayTimestamp = useMemoFirebase(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
  }, []);

  const visitorsTodayQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, "visitors"),
            where("checkInTime", ">=", todayTimestamp),
            orderBy("checkInTime", "desc")
          )
        : null,
    [firestore, todayTimestamp]
  );
  
  const { data: visitorsToday, isLoading: isLoadingVisitors } = useCollection<Visitor>(visitorsTodayQuery);

  const contractorsTodayQuery = useMemoFirebase(
      () =>
        firestore
          ? query(
              collection(firestore, "contractors"),
              where("checkInTime", ">=", todayTimestamp),
              orderBy("checkInTime", "desc")
            )
          : null,
      [firestore, todayTimestamp]
  );
  const { data: contractorsToday, isLoading: isLoadingContractors } = useCollection<Contractor>(contractorsTodayQuery);
  
  const contractorsOnSiteQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "contractors"), where("checkedOut", "==", false))
        : null,
    [firestore]
);
const { data: contractorsOnSite, isLoading: isLoadingContractorsOnSite } = useCollection<Contractor>(contractorsOnSiteQuery);


  const visitorsTodayCount = visitorsToday?.length ?? 0;
  const contractorsOnSiteCount = contractorsOnSite?.length ?? 0;
  
  const totalCheckInsToday = (visitorsToday?.length ?? 0) + (contractorsToday?.length ?? 0);

  const lastVisitor = visitorsToday?.[0];
  const recentVisitors = visitorsToday?.slice(0, 5) ?? [];
  
  const isLoading = isLoadingVisitors || isLoadingContractors || isLoadingContractorsOnSite;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Visitors Today"
              value={String(visitorsTodayCount)}
              icon={Users}
              description={visitorsTodayCount > 0 ? `${visitorsTodayCount} since midnight` : "No visitors yet"}
            />
            <StatCard
              title="Contractors On-site"
              value={String(contractorsOnSiteCount)}
              icon={HardHat}
              description={contractorsOnSiteCount > 0 ? "Currently on location" : "No contractors on site"}
            />
            <StatCard
              title="Total Check-Ins (Today)"
              value={String(totalCheckInsToday)}
              icon={LogIn}
              description="Visitors & Contractors"
            />
            <StatCard
              title="Last Visitor Check-In"
              value={lastVisitor?.name ?? "N/A"}
              icon={Clock}
              description={lastVisitor ? `at ${format(lastVisitor.checkInTime.toDate(), 'h:mm a')}` : 'Awaiting first visitor'}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 5 Visitors)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Check-In Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">Loading recent activity...</TableCell>
                </TableRow>
              )}
              {!isLoading && recentVisitors.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No visitors have checked in today.</TableCell>
                </TableRow>
              )}
              {!isLoading &&
                recentVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.company}</TableCell>
                    <TableCell className="text-right">
                      {format(visitor.checkInTime.toDate(), 'h:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
