
"use client";

import { useState, useMemo } from "react";
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
import { useAuth } from "@/context/auth-provider";
import { Visitor } from "@/lib/types";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { HardHat, User, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DeleteLogDialog } from "@/components/admin/delete-log-dialog";
import { ClearLogsDialog } from "@/components/admin/clear-logs-dialog";

export default function ActivityLogPage() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    type: "",
    name: "",
    company: "",
    contact: "",
    status: "",
  });

  const visitorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "visitors"), orderBy("checkInTime", "desc"))
        : null,
    [firestore]
  );
  const { data: logEntries, isLoading } = useCollection<Visitor>(visitorsQuery);
  
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    // If the 'all' value is selected, reset the filter for that key. Otherwise, set the new value.
    setFilters(prev => ({...prev, [key]: value === 'all' ? '' : value}));
  };

  const filteredLogs = useMemo(() => {
    if (!logEntries) return [];
    return logEntries.filter(entry => {
      const contactPerson = entry.type === 'visitor' ? entry.visiting : entry.personResponsible;
      const status = entry.checkedOut ? "out" : "in";

      return (
        (filters.type ? entry.type === filters.type : true) &&
        (filters.name ? entry.name.toLowerCase().includes(filters.name.toLowerCase()) : true) &&
        (filters.company ? entry.company.toLowerCase().includes(filters.company.toLowerCase()) : true) &&
        (filters.contact ? (contactPerson || '').toLowerCase().includes(filters.contact.toLowerCase()) : true) &&
        (filters.status ? status === filters.status : true)
      );
    });
  }, [logEntries, filters]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy, h:mm a');
  };

  const renderContactPerson = (entry: Visitor) => {
    if (entry.type === 'visitor') {
      return entry.visiting;
    }
    return entry.personResponsible;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Card>
      <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <CardTitle>Activity Log</CardTitle>
        {isAdmin && logEntries && logEntries.length > 0 && (
          <ClearLogsDialog logs={logEntries} />
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <Select value={filters.type} onValueChange={value => handleFilterChange('type', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Type..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
            </Select>
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
            <Input 
                placeholder="Filter by Contact..."
                value={filters.contact}
                onChange={e => handleFilterChange('contact', e.target.value)}
            />
            <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Status..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in">Checked In</SelectItem>
                    <SelectItem value="out">Checked Out</SelectItem>
                </SelectContent>
            </Select>
        </div>
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
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              filteredLogs.map((entry) => (
                <TableRow key={entry.id}>
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
                  {isAdmin && (
                    <TableCell className="text-right">
                        <DeleteLogDialog log={entry} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {!isLoading && !filteredLogs.length && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="h-24 text-center">
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
