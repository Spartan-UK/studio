import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, HardHat, LogIn, Clock } from "lucide-react";

const recentVisitors = [
  { name: 'David Lee', company: 'Data Systems', time: '9:05 AM' },
  { name: 'Sophia Chen', company: 'Marketing Co.', time: '9:02 AM' },
  { name: 'Michael Brown', company: 'Innovate LLC', time: '8:55 AM' },
  { name: 'Olivia Garcia', company: 'Tech Forward', time: '8:45 AM' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Visitors Today"
          value="42"
          icon={Users}
          description="+5 since yesterday"
        />
        <StatCard
          title="Contractors On-site"
          value="8"
          icon={HardHat}
          description="2 arrived this morning"
        />
        <StatCard
          title="Total Check-Ins (Today)"
          value="50"
          icon={LogIn}
          description="Peak time: 9 AM - 10 AM"
        />
        <StatCard
          title="Last Visitor Check-In"
          value="David Lee"
          icon={Clock}
          description="at 9:05 AM"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
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
              {recentVisitors.map((visitor) => (
                <TableRow key={visitor.name}>
                  <TableCell className="font-medium">{visitor.name}</TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell className="text-right">{visitor.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
