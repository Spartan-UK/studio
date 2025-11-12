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
import { Users, HardHat, LogIn, Clock, User as UserIcon } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { Visitor } from "@/lib/types";
import { collection, query, where, orderBy, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { firestore } = useFirebase();

  const todayTimestamp = useMemoFirebase(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(today);
  }, []);

  // This query is now safe for both public and authenticated users.
  // Security rules allow querying by check-in time.
  const activityTodayQuery = useMemoFirebase(
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
  
  const { data: activityToday, isLoading } = useCollection<Visitor>(activityTodayQuery);
  
  const visitorsTodayCount = useMemo(() => activityToday?.filter(a => a.type === 'visitor').length ?? 0, [activityToday]);
  const contractorsTodayCount = useMemo(() => activityToday?.filter(a => a.type === 'contractor').length ?? 0, [activityToday]);
  
  const totalCheckInsToday = visitorsTodayCount + contractorsTodayCount;
  
  const lastCheckIn = activityToday?.[0];
  const recentActivitySlice = activityToday?.slice(0, 5) ?? [];
  
  const finalLoading = isLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {finalLoading ? (
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
              title="Contractors Today"
              value={String(contractorsTodayCount)}
              icon={HardHat}
              description={contractorsTodayCount > 0 ? `${contractorsTodayCount} since midnight` : "No contractors yet"}
            />
            <StatCard
              title="Total Check-Ins (Today)"
              value={String(totalCheckInsToday)}
              icon={LogIn}
              description="Visitors & Contractors"
            />
            <StatCard
              title="Last Check-In"
              value={lastCheckIn?.name ?? "N/A"}
              icon={Clock}
              description={lastCheckIn ? `at ${format(lastCheckIn.checkInTime.toDate(), 'h:mm a')}` : 'Awaiting first check-in'}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Check-In Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalLoading && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading recent activity...</TableCell>
                </TableRow>
              )}
              {!finalLoading && recentActivitySlice.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No one has checked in today.</TableCell>
                </TableRow>
              )}
              {!finalLoading &&
                recentActivitySlice.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {activity.type === 'visitor' ? (
                         <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                           <UserIcon className="h-3.5 w-3.5" />
                           Visitor
                         </Badge>
                      ) : (
                         <Badge variant="outline" className="gap-1.5 pl-1.5 pr-2.5">
                           <HardHat className="h-3.5 w-3.5" />
                           Contractor
                         </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>{activity.company}</TableCell>
                    <TableCell className="text-right">
                      {format(activity.checkInTime.toDate(), 'h:mm a')}
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
