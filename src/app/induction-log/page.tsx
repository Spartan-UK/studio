"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const INDUCTION_VALIDITY_DAYS = 365;

export default function InductionLogPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const [filters, setFilters] = useState({
    name: "",
    company: "",
    status: "all",
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  // Only run the query if a user is logged in.
  const visitorsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, "visitors"),
            orderBy("inductionTimestamp", "desc")
          )
        : null,
    [firestore, user]
  );

  const { data: allVisitors, isLoading: isDataLoading } = useCollection<Visitor>(visitorsQuery);

  const isLoading = isUserLoading || isDataLoading;

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
            badgeVariant: 'destructive' as const,
            status: 'unknown',
            isExpired: true,
        };
    }

    if (record.inductionValid === false) {
      return {
        expiryDate: 'Expired',
        daysRemaining: -1,
        badgeVariant: 'destructive' as const,
        status: 'expired' as const,
        isExpired: true,
      };
    }

    const inductionDate = record.inductionTimestamp.toDate();
    const expiryDate = addDays(inductionDate, INDUCTION_VALIDITY_DAYS);
    const daysRemaining = differenceInDays(expiryDate, new Date());
    const isExpired = isBefore(expiryDate, new Date());

    let badgeVariant: "success" | "destructive" | "secondary" = "success";
    let status: "valid" | "expiring" | "expired" = "valid";

    if (isExpired) {
      badgeVariant = "destructive";
      status = "expired";
    } else if (daysRemaining < 30) {
      badgeVariant = "secondary";
      status = "expiring";
    }

    return {
      expiryDate: format(expiryDate, 'dd/MM/yy'),
      daysRemaining,
      badgeVariant,
      status,
      isExpired,
    };
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const filteredRecords = useMemo(() => {
    if (!uniqueInductionRecords) return [];
    return uniqueInductionRecords.filter(record => {
      const { status } = getExpiryInfo(record);
      const inductionDate = record.inductionTimestamp!.toDate();

      const isAfterStartDate = !date?.from || inductionDate >= date.from;
      const isBeforeEndDate = !date?.to || inductionDate <= date.to;

      return (
        (filters.name ? record.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.company ? record.company.toLowerCase().includes(filters.company.toLowerCase()) : true) &&
        (filters.status !== 'all' ? status === filters.status : true) &&
        isAfterStartDate &&
        isBeforeEndDate
      );
    });
  }, [uniqueInductionRecords, filters, date]);

  // If loading, show skeleton. If done loading and no user, show admin-only message.
  if (isUserLoading) {
     return (
        <Card>
          <CardHeader>
            <CardTitle>Induction Log</CardTitle>
          </CardHeader>
          <CardContent className="h-96 flex items-center justify-center">
             <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      );
  }
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Induction Log</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground mt-2">You must be logged in as an administrator to view the induction log.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Induction Log</CardTitle>
        <CardDescription>View and manage the status of all contractor and site visitor inductions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Input 
                placeholder="Filter by Name..."
                value={filters.name}
                onChange={e => handleFilterChange('name', e.target.value)}
            />
            <Input 
                placeholder="Filter by Company..."
                value={filters.company}
                onChange={e => handleFilterChange('company', e.target.value)}
            />
            <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expiring">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yy")} -{" "}
                        {format(date.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yy")
                    )
                  ) : (
                    <span>Pick an induction date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Last Induction Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading induction records...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              filteredRecords.map((record) => {
                const { expiryDate, daysRemaining, badgeVariant, isExpired } = getExpiryInfo(record);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.company}</TableCell>
                    <TableCell>{record.inductionTimestamp ? format(record.inductionTimestamp.toDate(), 'dd/MM/yy') : 'N/A'}</TableCell>
                    <TableCell>{expiryDate}</TableCell>
                    <TableCell>
                       <Badge variant={badgeVariant} className={cn(
                        badgeVariant === 'success' && 'bg-green-500 hover:bg-green-600',
                        badgeVariant === 'secondary' && 'bg-yellow-500 hover:bg-yellow-600',
                        badgeVariant === 'destructive' && 'bg-red-500 hover:bg-red-600'
                       )}>
                        {record.inductionValid === false ? 'Expired' : (daysRemaining === null ? 'Unknown' : isExpired ? 'Expired' : `${daysRemaining} days`)}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {record.id && !isExpired && record.inductionValid !== false && (
                        <ForceExpireDialog 
                          visitorId={record.id} 
                          visitorName={record.name} 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            {!isLoading && !filteredRecords.length && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No induction records found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
