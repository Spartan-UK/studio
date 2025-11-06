import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VisitorsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Log</CardTitle>
      </CardHeader>
      <CardContent>
        <p>A table of all visitor check-ins will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
